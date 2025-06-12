const settings = require('../../settings.json');
const fs = require('fs');
const path = require('path');
const { loadJsonFile } = require('../helper');
const Logger = require('../utils/logger');
const logger = new Logger('SONGDB');

const songdbF = {};
const main = {
  songdb: {
    "2016": {}, "2017": {}, "2018": {}, "2019": {},
    "2020": {}, "2021": {}, "2022": {}
  },
  localisation: loadJsonFile('Platforms/openparty-all/localisation.json', '../database/Platforms/openparty-all/localisation.json')
};

// Load song database
songdbF.db = loadJsonFile('Platforms/openparty-all/songdbs.json', '../database/Platforms/openparty-all/songdbs.json');

songdbF.missingAssets = { pc: [] };
songdbF.assetsPlaceholder = {
  "banner_bkgImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518680733192222/New_Project_82_Copy_0ED1403.png",
  "coach1ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "coach2ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "coach3ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "coach4ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "coverImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Cover_Generic.tga.ckd/f61d769f960444bec196d94cfd731185.ckd",
  "cover_smallImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518681039384627/New_Project_82_8981698.png",
  "expandCoachImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Cover_AlbumCoach.tga.ckd/dc01eb7b94e0b10c0f52a0383e51312e.ckd",
  "videoPreviewVideoURL": "",
  "map_bkgImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518680733192222/New_Project_82_Copy_0ED1403.png"
};

// Function to generate assets and handle platform differences
songdbF.getAsset = function (platform, codename, overrideMapBkg = false, modifier = (a) => a) {
  let currentPlatform = ['pc', 'orbis', 'durango'].includes(platform) ? 'x1' : platform;
  let platformAssets = {};

  if (!songdbF.areAllValuesEmpty(songdbF.db[codename].assets[currentPlatform])) {
    platformAssets = { ...songdbF.db[codename].assets[currentPlatform] };
  } else if (!songdbF.areAllValuesEmpty(songdbF.db[codename].assets.common)) {
    platformAssets = { ...songdbF.db[codename].assets.common };
  } else {
    platformAssets = { ...songdbF.assetsPlaceholder };
  }

  // overrideMapBkg
  if (overrideMapBkg || !platformAssets.banner_bkgImageUrl) {
    platformAssets.banner_bkgImageUrl = platformAssets.map_bkgImageUrl;
  }

  return modifier({ ...platformAssets });
};

// Generate Song Database for a specific platform and version
songdbF.generateSongdb = function (platform = 'pc', version = '2017', style = false) {
  const newDb = {};

  Object.keys(songdbF.db).forEach(codename => {
    const check = {
      missing: false,
      log: [

      ]
    }
    let song = { ...songdbF.db[codename] };
    let assets = songdbF.getAsset(platform, codename, style);
    song.assets = assets; // USE Platform Specific Assets

    if (2020 >= version) song.mapPreviewMpd = song?.mapPreviewMpd?.vp8 ? song.mapPreviewMpd.vp8 : song.mapPreviewMpd;

    // Handle custom type name localization
    if (song.customTypeNameId) {
      song.customTypeName = main.localisation[song.customTypeNameId]?.en || `MISSING: ${song.customTypeNameId}`;
    }

    // Generate URLs if not available
    song.urls = song.urls || songdbF.generateUrls(codename, song);

    // Normalize arrays for JD20-
    if (2020 >= version) {
      song.skuIds = songdbF.normalizeToArray(song.skuIds);
      song.tags = songdbF.normalizeToArray(song.tags);
      song.searchTagsLocIds = songdbF.normalizeToArray(song.searchTagsLocIds, ['30000315']);
      song.searchTags = songdbF.normalizeToArray(song.searchTags);
      song.jdmAttributes = songdbF.normalizeToArray(song.jdmAttributes);
    }

    newDb[codename] = song;
  });

  return newDb;
};

// Function to handle MPD generation for video encoding
songdbF.getMultiMPD = function (song) {
  return {
    "vp8": songdbF.getMPD(song, 'vp8'),
    "vp9": songdbF.getMPD(song, 'vp9')
  };
};

// Generate MPD XML dynamically
songdbF.getMPD = function (song, codec) {
  return song.mapPreviewMpd[codec] ? song.mapPreviewMpd[codec] : "vp8";
};

// Generate URLs if not available
songdbF.generateUrls = function (codename, song) {
  const baseUrl = `jmcs://jd-contents/${codename}/`;
  return {
    [`${baseUrl}${codename}_AudioPreview.ogg`]: song.urls?.[`${baseUrl}${codename}_AudioPreview.ogg`] || "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_HIGH.vp8.webm`]: "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_HIGH.vp9.webm`]: "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_MID.vp8.webm`]: "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_MID.vp9.webm`]: "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_LOW.vp8.webm`]: "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_LOW.vp9.webm`]: "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_ULTRA.vp8.webm`]: "",
    [`${baseUrl}${codename}_MapPreviewNoSoundCrop_ULTRA.vp9.webm`]: "",
    // Other URLs go here
  };
};

// Normalize value to array
songdbF.normalizeToArray = function (value, defaultValue = []) {
  return Array.isArray(value) ? value : Object.values(value || defaultValue);
};

// Check if all object values are empty
songdbF.areAllValuesEmpty = function (obj) {
  if (obj) {
    return Object.values(obj).every(value => value === "");
  }
  else {
    return true
  }
};

// Generate the entire song database
songdbF.generate = function () {
  Object.keys(main.songdb).forEach(version => {
    main.songdb[version] = {
      pcdreyn: {},
      pcparty: songdbF.generateSongdb('pc', version, true),
      pc: songdbF.generateSongdb('pc', version, false),
      nx: songdbF.generateSongdb('nx', version, false),
      wiiu: songdbF.generateSongdb('wiiu', version, false)
    };
  });
};

songdbF.generateSonglist = function () {
  logger.info(`Processing Songdbs`)
  songdbF.generate()
  logger.info(`${Object.keys(main.songdb[2017].pc).length} Maps Loaded`)
  return main.songdb
}

module.exports = { songdbF }
