const axios = require('axios');
const fs = require('fs');
const songdb = require('./lib/songdb').songdbF;
const settings = require('../settings.json');

console.log('[VAR] Initializing....');

const replaceDomainPlaceholder = (obj, domain) => {
  if (typeof obj === 'string') {
    return obj.replace('{SettingServerDomainVarOJDP}', domain);
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceDomainPlaceholder(item, domain));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = replaceDomainPlaceholder(obj[key], domain);
    }
    return newObj;
  }
  return obj;
};

const main = {
  skupackages: {
    pc: require('../database/Platforms/jd2017-pc/sku-packages.json'),
    nx: require('../database/Platforms/jd2017-nx/sku-packages.json'),
    wiiu: require('../database/Platforms/jd2017-wiiu/sku-packages.json'),
    durango: require('../database/Platforms/jd2017-durango/sku-packages.json'),
    orbis: require('../database/Platforms/jd2017-orbis/sku-packages.json')
  },
  entities: replaceDomainPlaceholder(require('../database/v2/entities.json'), settings.server.domain),
  configuration: replaceDomainPlaceholder(require('../database/v1/configuration.json'), settings.server.domain),
  subscription: require('../database/db/subscription.json'),
  packages: require('../database/packages.json'),
  block: require('../database/carousel/block.json'),
  leaderboard: require("../database/db/leaderboard.json"),
  quests: require("../database/db/quests.json"),
  questsnx: require("../database/db/quests-nx.json"),
  questspc: require("../database/db/quests-pc.json"),
  items: require("../database/db/items.json"),
  upsellvideos: require("../database/carousel/pages/upsell-videos.json"),
  dancemachine_pc: require("../database/db/dancemachine_pc.json"),
  dancemachine_nx: require("../database/db/dancemachine_nx.json"),
  avatars: require("../database/db/avatars.json"),
  dancerprofile: require("../database/db/dancerprofile.json"),
  aliases: require("../database/db/aliases.json"),
  home: require("../database/db/home.json"),
  jdtv: require("../database/db/jdtv.json"),
  playlistdb: require("../database/db/playlistdb.json"),
  playlists: require("../database/db/playlists.json"),
  create_playlist: require("../database/carousel/pages/create_playlist.json"),
  songdb: { "2016": {}, "2017": {}, "2018": {}, "2019": {}, "2020": {}, "2021": {}, "2022": {} },
  localisation: require('../database/Platforms/openparty-all/localisation.json')
};

main.songdb = songdb.generateSonglist();

module.exports = {
  main 
}