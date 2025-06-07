const Logger = require('../utils/logger');
const logger = new Logger('CAROUSEL');

logger.info(`Initializing....`);

const { CloneObject, loadJsonFile } = require('../helper');
const cClass = require("./classList.json");
const settings = require('../../settings.json');
const SongService = require('../services/SongService');
const MostPlayedService = require('../services/MostPlayedService');
const AccountService = require('../services/AccountService'); // Import AccountService

let carousel = {}; //avoid list cached

const WEEKLY_PLAYLIST_PREFIX = 'DFRecommendedFU';

function addCategories(categories) {
  carousel.categories.push(Object.assign({}, categories));
}

function generateCategories(name, items, type = "partyMap") {
  return {
    __class: "Category",
    title: name,
    act: "ui_carousel",
    isc: "grp_row",
    items: generatePartymap(items, type).concat(cClass.itemSuffleClass),
  };
}

function generatePartymap(arrays, type = "partyMap") {
  return arrays.map(mapName => ({
    __class: "Item",
    isc: "grp_cover",
    act: "ui_component_base",
    components: [{
      __class: "JD_CarouselContentComponent_Song",
      mapName
    }],
    actionList: type
  }));
}

function generateInfomap(arrays, type = "infoMap") {
  return arrays.map(mapName => ({
    __class: "Item",
    isc: "grp_cover",
    act: "ui_component_base",
    components: [{
      __class: "JD_CarouselContentComponent_Song",
      mapName
    }],
    actionList: type,
  }));
}

function shuffleArray(array) {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray.slice(0, 24);
}

function processPlaylists(playlists, type = "partyMap") {
  playlists.forEach(playlist => {
    if (!playlist.name.startsWith(WEEKLY_PLAYLIST_PREFIX)) {
      addCategories(generateCategories(`[icon:PLAYLIST]${playlist.name}`, playlist.songlist, type));
    }
  });
}

async function generateWeeklyRecommendedSong(playlists, type = "partyMap") {
  const currentWeekNumber = MostPlayedService.getWeekNumber();
  playlists.forEach(playlist => {
    if (playlist.name === `${WEEKLY_PLAYLIST_PREFIX}${currentWeekNumber}`) {
      addCategories(generateCategories(`[icon:PLAYLIST]Weekly: ${playlist.RecommendedName || ""}`, playlist.songlist, type));
    }
  });
}

function addJDVersion(songMapNames, type = "partyMap") {
  addCategories(generateCategories("ABBA: You Can Dance", SongService.filterSongsByJDVersion(songMapNames, 4884), type));
  addCategories(generateCategories("Just Dance Asia", SongService.filterSongsByJDVersion(songMapNames, 4514), type));
  addCategories(generateCategories("Just Dance Kids", SongService.filterSongsByJDVersion(songMapNames, 123), type));
  for (let year = 2069; year >= 2014; year--) {
    addCategories(generateCategories(`Just Dance ${year}`, SongService.filterSongsByJDVersion(songMapNames, year), type));
  }
  for (let year = 4; year >= 1; year--) {
    addCategories(generateCategories(`Just Dance ${year}`, SongService.filterSongsByJDVersion(songMapNames, year), type));
  }
  addCategories(generateCategories("Unplayable Songs", SongService.filterSongsByJDVersion(songMapNames, 404)));
}

exports.generateCarousel = async (search, type = "partyMap", profileId = null) => {
  carousel = {};
  carousel = CloneObject(cClass.rootClass);
  carousel.actionLists = cClass.actionListsClass;
  const allSongMapNames = SongService.getAllMapNames();

  // Dynamic Carousel System
  addCategories(generateCategories(settings.server.modName, CloneObject(shuffleArray(allSongMapNames)), type)); // Shuffle main category

  let userProfile = null;
  if (profileId) {
    userProfile = await AccountService.getUserData(profileId);
  }

  const allSongsData = SongService.getAllSongs(); // Get all song details once

  if (userProfile) {
    let recommendedSongs = [];
    // 1. "Recommended For You (Based on Your Plays)"
    if (userProfile.history && Object.keys(userProfile.history).length > 0) {
      recommendedSongs = Object.entries(userProfile.history)
        .sort(([, countA], [, countB]) => countB - countA) // Sort by play count desc
        .map(([mapName]) => mapName)
        .slice(0, 24);
    } else if (userProfile.scores && Object.keys(userProfile.scores).length > 0) {
      // Fallback to scores if history is not available or empty
      recommendedSongs = Object.entries(userProfile.scores)
        .filter(([, scoreData]) => scoreData && typeof scoreData.timesPlayed === 'number')
        .sort(([, scoreA], [, scoreB]) => scoreB.timesPlayed - scoreA.timesPlayed)
        .map(([mapName]) => mapName)
        .slice(0, 24);
    }

    if (recommendedSongs.length > 0) {
      addCategories(generateCategories("Recommended For You", CloneObject(recommendedSongs), type));
    } else {
      // Fallback if no play history or scores with timesPlayed
      addCategories(generateCategories("Recommended For You", CloneObject(shuffleArray(allSongMapNames)), type));
    }

    // 2. "More from Artists You Enjoy"
    const artistCounts = {};
    const playedAndFavoritedSongs = new Set([
      ...(userProfile.history ? Object.keys(userProfile.history) : []),
      ...(userProfile.favorites ? Object.keys(userProfile.favorites) : [])
    ]);

    playedAndFavoritedSongs.forEach(mapName => {
      const song = allSongsData[mapName];
      if (song && song.artist) {
        artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 
                                    (userProfile.history?.[mapName] || 1); // Weight by play count or 1 for favorite
      }
    });

    const topArtists = Object.entries(artistCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3) // Get top 3 artists
      .map(([artist]) => artist);

    topArtists.forEach(artistName => {
      const artistSongs = allSongMapNames.filter(mapName => {
        const song = allSongsData[mapName];
        return song && song.artist === artistName && !playedAndFavoritedSongs.has(mapName); // Exclude already prominent songs
      });
      if (artistSongs.length > 0) {
        addCategories(generateCategories(`[icon:ARTIST] More from ${artistName}`, CloneObject(shuffleArray(artistSongs)).slice(0,12), type));
      }
    });

    // 3. "Because You Liked..."
    const favoriteMaps = Object.keys(userProfile.favorites || {});
    if (favoriteMaps.length > 0) {
      const shuffledFavorites = shuffleArray(favoriteMaps);
      const numBecauseYouLiked = Math.min(shuffledFavorites.length, 2); // Max 2 "Because you liked" categories

      for (let i = 0; i < numBecauseYouLiked; i++) {
        const favMapName = shuffledFavorites[i];
        const favSong = allSongsData[favMapName];
        if (!favSong) continue;

        let relatedSongs = [];
        // Related by artist
        allSongMapNames.forEach(mapName => {
          const song = allSongsData[mapName];
          if (song && song.artist === favSong.artist && mapName !== favMapName && !favoriteMaps.includes(mapName)) {
            relatedSongs.push(mapName);
          }
        });
        // Related by original JD version
        allSongMapNames.forEach(mapName => {
          const song = allSongsData[mapName];
          if (song && song.originalJDVersion === favSong.originalJDVersion && mapName !== favMapName && !favoriteMaps.includes(mapName) && !relatedSongs.includes(mapName)) {
            relatedSongs.push(mapName);
          }
        });

        if (relatedSongs.length > 0) {
          addCategories(generateCategories(`[icon:HEART] Because You Liked ${favSong.title}`, CloneObject(shuffleArray(relatedSongs)).slice(0, 10), type));
        }
      }
      // Original "Your Favorites" category
      addCategories(generateCategories("[icon:FAVORITE] Your Favorites", CloneObject(favoriteMaps), type));
    }

    // Your Recently Played
    const recentlyPlayedMaps = (userProfile.songsPlayed || []).slice(-24).reverse(); // Get last 24 played, most recent first
    if (recentlyPlayedMaps.length > 0) {
      addCategories(generateCategories("[icon:HISTORY] Your Recently Played", CloneObject(recentlyPlayedMaps), type));
    }
  } else {
    // Fallback for non-logged in users or no profileId
    addCategories(generateCategories("Recommended For You", CloneObject(shuffleArray(allSongMapNames)), type));
  }

  addCategories(generateCategories("[icon:PLAYLIST]Recently Added!", CloneObject(SongService.filterSongsByTags(allSongMapNames, 'NEW')), type));
  await generateWeeklyRecommendedSong(loadJsonFile('carousel/playlist.json', '../database/data/carousel/playlist.json'), type);
  processPlaylists(loadJsonFile('carousel/playlist.json', '../database/data/carousel/playlist.json'), type);
  addJDVersion(allSongMapNames, type);
  addCategories(generateCategories(`Most Played Weekly!`, CloneObject(await MostPlayedService.getGlobalPlayedSong()), type));
  addCategories(Object.assign({}, cClass.searchCategoryClass));
  if (search !== "") {
    addCategories(generateCategories(`[icon:SEARCH_RESULT] Result Of: ${search}`, CloneObject(SongService.filterSongsBySearch(allSongMapNames, search)), type));
  }
  return carousel;
};

exports.generateCoopCarousel = async (search) => JSON.parse(JSON.stringify(await exports.generateCarousel(search, "partyMapCoop")));

exports.generateRivalCarousel = async (search) => JSON.parse(JSON.stringify(await exports.generateCarousel(search, "partyMap")));

exports.generateSweatCarousel = async (search) => JSON.parse(JSON.stringify(await exports.generateCarousel(search, "sweatMap")));

exports.generateChallengeCarousel = async (search) => JSON.parse(JSON.stringify(await exports.generateCarousel(search, "create-challenge")));

exports.updateMostPlayed = async (maps) => await MostPlayedService.updateMostPlayed(maps);
