console.log(`[CAROUSEL] Initializing....`);

const { CloneObject, readDatabaseJson, loadJsonFile } = require('../helper');
const fs = require('fs');
const path = require('path');
const cClass = require("./classList.json");
const songdb = loadJsonFile('Platforms/openparty-all/songdbs.json', '../database/Platforms/openparty-all/songdbs.json');
const helper = require('../helper')
const settings = require('../../settings.json')
var mostPlayed = {}

mostPlayed = loadJsonFile('carousel/mostplayed.json', '../database/carousel/mostplayed.json');
var carousel = {}; //avoid list cached

const WEEKLY_PLAYLIST_PREFIX = 'DFRecommendedFU';

function updateMostPlayed(maps) {
  const currentWeek = getWeekNumber();
  mostPlayed[currentWeek] = mostPlayed[currentWeek] || {};
  mostPlayed[currentWeek][maps] = (mostPlayed[currentWeek][maps] || 0) + 1;
  fs.writeFileSync(path.join(helper.getSavefilePath(), 'carousel/mostplayed.json'), JSON.stringify(mostPlayed, null, 2));
}

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

function filterSongs(songdbs, filterFunction) {
  return songdbs.filter(filterFunction).sort((a, b) => {
    const titleA = (songdb[a].title + songdb[a].mapName).toLowerCase();
    const titleB = (songdb[b].title + songdb[b].mapName).toLowerCase();
    return titleA.localeCompare(titleB);
  });
}


// The following function was taken from here: https://stackoverflow.com/questions/16096872/how-to-sort-2-dimensional-array-by-column-value (answer by jahroy)
function compareSecondColumn(a, b) {
  if (a[1] === b[1]) {
    return 0;
  }
  else {
    return (a[1] < b[1]) ? -1 : 1;
  }
}


function sortByTitle(list, word) {
  var x = [];
  var doesntContainWord = [];
  for (var i = 0; i < list.length; i++) {
    var titleIndex = songdb[list[i]].title.toLowerCase().indexOf(word);
    if (titleIndex === -1) {
      doesntContainWord.push(list[i]);
    } else {
      x.push([list[i], titleIndex]);
    }
  }
  doesntContainWord.sort();
  x.sort(compareSecondColumn);
  var toReturn = [];
  for (var j = 0; j < x.length; j++) {
    toReturn[j] = x[j][0];
  }
  return toReturn.concat(doesntContainWord);
}


function filterSongsBySearch(songdbs, search) {
  // Filter songs based on search criteria
  return sortByTitle(filterSongs(songdbs, item => {
    const song = songdb[item];
    return (
      (song.title && song.title.toLowerCase().includes(search.toLowerCase())) ||
      (song.artist && song.artist.toLowerCase().includes(search.toLowerCase())) ||
      (song.mapName && song.mapName.toLowerCase().includes(search.toLowerCase())) ||
      (song.originalJDVersion && song.originalJDVersion == search) ||
      (song.tags && song.tags.includes(search))
    );
  }), search.toLowerCase());
}

function filterSongsByFirstLetter(songdbs, filter) {
  return filterSongs(songdbs, song => {
    const title = songdb[song].title.toLowerCase();
    const regex = new RegExp(`^[${filter}].*`);
    return regex.test(title);
  });
}

function filterSongsByJDVersion(songdbs, version) {
  return filterSongs(songdbs, song => songdb[song].originalJDVersion === version);
}

function filterSongsByTags(songdbs, Key) {
  return filterSongs(songdbs, song => {
    const songData = songdb[song];
    return songData && songData.tags && songData.tags.indexOf(Key) > -1;
  });
}

function getGlobalPlayedSong() {
  try {
    return Object.entries(mostPlayed[getWeekNumber()])
      .sort((a, b) => b[1] - a[1])
      .map(item => item[0]);
  } catch (err) {
    return [];
  }
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

function generateWeeklyRecommendedSong(playlists, type = "partyMap") {
  playlists.forEach(playlist => {
    if (playlist.name === `${WEEKLY_PLAYLIST_PREFIX}${getWeekNumber()}`) {
      addCategories(generateCategories(`[icon:PLAYLIST]Weekly: ${playlist.RecommendedName || ""}`, playlist.songlist, type));
    }
  });
}

function getWeekNumber() {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), 0, 1);
  const daysSinceStartOfWeek = Math.floor((now - startOfWeek) / (24 * 60 * 60 * 1000));
  return Math.ceil((daysSinceStartOfWeek + 1) / 7);
}

function addJDVersion(songdbs, type = "partyMap") {
  addCategories(generateCategories("ABBA: You Can Dance", filterSongsByJDVersion(songdbs, 4884), type));
  addCategories(generateCategories("Just Dance Asia", filterSongsByJDVersion(songdbs, 4514), type));
  addCategories(generateCategories("Just Dance Kids", filterSongsByJDVersion(songdbs, 123), type));
  for (let year = 2069; year >= 2014; year--) {
    addCategories(generateCategories(`Just Dance ${year}`, filterSongsByJDVersion(songdbs, year), type));
  }
  for (let year = 4; year >= 1; year--) {
    addCategories(generateCategories(`Just Dance ${year}`, filterSongsByJDVersion(songdbs, year), type));
  }
  addCategories(generateCategories("Unplayable Songs", filterSongsByJDVersion(songdbs, 404)));
}

exports.generateCarousel = (search, type = "partyMap") => {
  carousel = {};
  carousel = CloneObject(cClass.rootClass);
  carousel.actionLists = cClass.actionListsClass
  const songdbs = Object.keys(songdb)


  // Dynamic Carousel System
  addCategories(generateCategories(settings.server.modName, filterSongs(songdbs, song => true), type));
  addCategories(generateCategories("Recommended For You", CloneObject(shuffleArray(songdbs), type)));
  addCategories(generateCategories("[icon:PLAYLIST]Recently Added!", CloneObject(filterSongsByTags(songdbs, 'NEW')), type));
  generateWeeklyRecommendedSong(loadJsonFile('carousel/playlist.json', '../database/carousel/playlist.json'), type);
  processPlaylists(loadJsonFile('carousel/playlist.json', '../database/carousel/playlist.json'), type);
  addJDVersion(songdbs, type);
  addCategories(generateCategories(`Most Played Weekly!`, CloneObject(getGlobalPlayedSong()), type));
  addCategories(Object.assign({}, cClass.searchCategoryClass));
  if (search !== "") {
    addCategories(generateCategories(`[icon:SEARCH_RESULT] Result Of: ${search}`, CloneObject(filterSongsBySearch(songdbs, search)), type));
  }
  return carousel
}

exports.generateCoopCarousel = (search) => JSON.parse(JSON.stringify(generateCarousel(search, "partyMapCoop")));

exports.generateRivalCarousel = (search) => JSON.parse(JSON.stringify(generateCarousel(search, "partyMap")));

exports.generateSweatCarousel = (search) => JSON.parse(JSON.stringify(generateCarousel(search, "sweatMap")));

exports.generateChallengeCarousel = (search) => JSON.parse(JSON.stringify(generateCarousel(search, "create-challenge")));

exports.updateMostPlayed = (maps) => updateMostPlayed(maps);
