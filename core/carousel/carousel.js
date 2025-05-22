const Logger = require('../utils/logger');
const logger = new Logger('CAROUSEL');

logger.info(`Initializing....`);

const { CloneObject, loadJsonFile } = require('../helper');
const cClass = require("./classList.json");
const settings = require('../../settings.json');
const SongService = require('../services/SongService');
const MostPlayedService = require('../services/MostPlayedService');

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

exports.generateCarousel = async (search, type = "partyMap") => {
  carousel = {};
  carousel = CloneObject(cClass.rootClass);
  carousel.actionLists = cClass.actionListsClass;
  const allSongMapNames = SongService.getAllMapNames();

  // Dynamic Carousel System
  addCategories(generateCategories(settings.server.modName, allSongMapNames, type));
  addCategories(generateCategories("Recommended For You", CloneObject(shuffleArray(allSongMapNames), type)));
  addCategories(generateCategories("[icon:PLAYLIST]Recently Added!", CloneObject(SongService.filterSongsByTags(allSongMapNames, 'NEW')), type));
const path = require('path');
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
