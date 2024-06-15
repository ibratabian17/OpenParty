//Game
console.log(`[DEFROUTE] Initializing....`)
var requestCountry = require("request-country");
var md5 = require('md5');
const core = {
  main: require('../var').main,
  CloneObject: require('../helper').CloneObject,
  generateCarousel: require('../carousel/carousel').generateCarousel, generateSweatCarousel: require('../carousel/carousel').generateSweatCarousel, generateCoopCarousel: require('../carousel/carousel').generateCoopCarousel, updateMostPlayed: require('../carousel/carousel').updateMostPlayed,
  signer: require('../lib/signUrl')
}
const path = require('path');
const signer = require('../lib/signUrl')
const deployTime = Date.now()

function checkAuth(req, res) {
  if (!(req.headers["x-skuid"].startsWith("jd") || req.headers["x-skuid"].startsWith("JD")) || !req.headers["authorization"].startsWith("Ubi")) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.status(400).send({
      'error': 400,
      'message': 'Bad request! Oops you didn\'t specify what file should we give you, try again'
    });
    return false;
  }
  return true;
}
function returnSongdb(input, res) {
  const songdb = core.main.songdb;
  switch (true) {
    case input.startsWith("jd2017-pc"):
      res.send(songdb['2017'].pc);
      break;
    case input.startsWith("jd2017-durango"):
      res.send(songdb['2017'].pc);
      break;
    case input.startsWith("jd2017-orbis"):
      res.send(songdb['2017'].pc);
      break;
    case input.startsWith("jd2017-nx"):
      res.send(songdb['2017'].nx);
      break;
    case input.startsWith("openparty-pc"):
      res.send(songdb['2017'].pcparty);
      break;
    case input.startsWith("jd2023pc-next"):
      res.send(songdb['2017'].pcdreyn);
      break;
    case input.startsWith("jd2024pc-next"):
      res.send(songdb['2017'].pcdreyn);
      break;
    case input.startsWith("jd2018-nx"):
      res.send(songdb['2018'].nx);
      break;
    case input.startsWith("jd2019-nx"):
      res.send(songdb['2019'].nx);
      break;
    case input.startsWith("jd2017-nx"):
      res.send(songdb['2017'].nx);
      break;
    case input.startsWith("openparty-nx"):
      res.send(songdb['2018'].nx);
      break;
    case input.startsWith("jd2018-pc"):
      res.send(songdb['2017'].pc);
      break;
    case input.startsWith("JD2021PC"):
      res.send(songdb['2017'].pcparty);
      break;
    case input.startsWith("jd2022-pc"):
      res.send(songdb['2017'].pcparty);
      break;
    case input.startsWith("jd2019-wiiu"):
      res.send(songdb['2019'].wiiu);
      break;
    default:
      res.send('Invalid Game');
      break;
  }
}


exports.initroute = (app, express, server) => {
  app.get("/songdb/v1/songs", (req, res) => {
    if (checkAuth(req, res)) {
      returnSongdb(req.headers["x-skuid"], res);
    }
  });

  app.get("/songdb/v2/songs", (req, res) => {
    var sku = req.header('X-SkuId');
    const songDBPlatform = sku && sku.startsWith('jd2019-wiiu') ? 'wiiu' : 'nx';
    const songDBUrl = signer.generateSignedURL(`https://jdp.justdancenext.xyz/private/songdb/prod/${req.headers["x-skuid"]}.${md5(JSON.stringify(core.main.songdb['2019'][songDBPlatform]))}.json`);
    const localizationDB = signer.generateSignedURL(`https://jdp.justdancenext.xyz/private/songdb/prod/localisation.${md5(JSON.stringify(core.main.localisation))}.json`);
    res.send({
      "requestSpecificMaps": require('../../database/db/requestSpecificMaps.json'),
      "localMaps": [],
      "songdbUrl": songDBUrl,
      "localisationUrl": localizationDB
    });
  });

  app.get("/private/songdb/prod/:filename", (req, res) => {
    if (signer.verifySignedURL(req.originalUrl)) {
      if (req.path.split('/')[4].startsWith('localisation')) {
        res.send(core.main.localisation);
      } else {
        var sku = req.header('X-SkuId');
        const songDBPlatform = sku && sku.startsWith('jd2019-wiiu') ? 'wiiu' : 'nx';
        res.send(core.main.songdb['2019'][songDBPlatform]);
      }
    } else {
      res.send('Unauthorizated');
    }
  });

  app.get('/packages/v1/sku-packages', function (req, res) {
    if (checkAuth(req, res)) {
      if (req.headers["x-skuid"].includes("wiiu")) res.send(core.main.skupackages.wiiu);
      if (req.headers["x-skuid"].includes("nx")) res.send(core.main.skupackages.nx);
      if (req.headers["x-skuid"].includes("pc")) res.send(core.main.skupackages.pc);
      if (req.headers["x-skuid"].includes("durango")) res.send(core.main.skupackages.durango);
      if (req.headers["x-skuid"].includes("orbis")) res.send(core.main.skupackages.orbis);
    }
  });

  app.post("/carousel/v2/pages/party", (req, res) => {
    var search = ""
    if (req.body.searchString != "") {
      search = req.body.searchString
    } else if (req.body.searchTags != undefined) {
      search = req.body.searchTags[0]
    } else {
      search = ""
    }
    res.send(core.CloneObject(core.generateCarousel(search, "partyMap")))
  });
  app.post("/carousel/v2/pages/sweat", (req, res) => {
    var search = ""
    if (req.body.searchString != "") {
      search = req.body.searchString
    } else if (req.body.searchTags != undefined) {
      search = req.body.searchTags[0]
    } else {
      search = ""
    }
    res.send(core.CloneObject(core.generateCarousel(search, "sweatMap")))
  });
  app.post("/carousel/v2/pages/create-challenge", (req, res) => {
    var search = ""
    if (req.body.searchString != "") {
      search = req.body.searchString
    } else if (req.body.searchTags != undefined) {
      search = req.body.searchTags[0]
    } else {
      search = ""
    }
    res.send(core.CloneObject(core.generateCarousel(search, "create-challenge")))
  });
  app.post("/carousel/v2/pages/partycoop", (req, res) => {
    var search = ""
    if (req.body.searchString != "") {
      search = req.body.searchString
    } else if (req.body.searchTags != undefined) {
      search = req.body.searchTags[0]
    } else {
      search = ""
    }
    res.send(core.CloneObject(core.generateCarousel(search, "partyMap")))
  });
  app.post("/carousel/v2/pages/avatars", function (request, response) {
    response.send(core.main.avatars);
  });
  app.post("/carousel/v2/pages/dancerprofile", function (request, response) {
    response.send(core.main.dancerprofile);
  });
  app.post("/carousel/v2/pages/jdtv", function (request, response) {
    response.send(core.main.jdtv);
  });
  app.post("/carousel/v2/pages/jdtv-nx", function (request, response) {
    response.send(core.main.jdtv);
  });
  app.post("/carousel/v2/pages/quests", function (request, response) {
    response.send(core.main.quests);
  });

  app.post("/carousel/v2/pages/jd2019-playlists", (request, response) => {
    response.send(core.main.playlists);
  });
  app.post("/carousel/v2/pages/jd2020-playlists", (request, response) => {
    response.send(core.main.playlists);
  });
  app.post("/carousel/v2/pages/jd2021-playlists", (request, response) => {
    response.send(core.main.playlists);
  });
  app.post("/carousel/v2/pages/jd2022-playlists", (request, response) => {
    response.send(core.main.playlists);
  });

  app.post("/sessions/v1/session", (request, response) => {
    response.send({
      "pairingCode": "000000",
      "sessionId": "00000000-0000-0000-0000-000000000000",
      "docId": "0000000000000000000000000000000000000000"
    });
  });

  app.get("/songdb/v1/localisation", function (request, response) {
    response.send(core.main.localisation);
  });

  // Home
  app.post("/home/v1/tiles", function (request, response) {
    response.send(core.main.home);
  });

  // Aliases
  app.get("/aliasdb/v1/aliases", function (request, response) {
    response.send(core.main.aliases);
  });

  // Playlists
  app.get("/playlistdb/v1/playlists", function (request, response) {
    response.send(core.main.playlistdb);
  });


  app.get("/profile/v2/country", function (request, response) {
    var country = requestCountry(request);
    if (country == false) {
      country = "US";
    }
    response.send('{ "country": "' + country + '" }');
  });

  app.post("/carousel/v2/pages/sweat", (req, res) => {
    res.send(core.main.sweat)
  });

  app.get('/leaderboard/v1/coop_points/mine', function (req, res) {
    res.send(core.main.leaderboard);
  });

  app.get('/:version/spaces/:SpaceID/entities', function (req, res) {
    res.send(core.main.entities);
  });

  app.post("/subscription/v1/refresh", (req, res) => {
    res.send(core.main.subscription);
  });

  app.get("/questdb/v1/quests", (req, res) => {
    var sku = req.header('X-SkuId');
    if (sku && sku.startsWith('jd2017-nx-all')) {
      res.send(core.main.questsnx);
    } else {
      res.send(core.main.questspc);
    }
  });


  app.get("/session-quest/v1/", (request, response) => {
    response.send({
      "__class": "SessionQuestService::QuestData",
      "newReleases": []
    });
  });

  app.get("/customizable-itemdb/v1/items", (req, res) => {
    res.send(core.main.items);
  });

  app.post("/carousel/v2/pages/upsell-videos", (req, res) => {
    res.send(core.main.upsellvideos);
  });

  app.get("/constant-provider/v1/sku-constants", (req, res) => {
    res.send(core.main.block);
  });

  app.get("/dance-machine/v1/blocks", (req, res) => {
    if (req.headers["x-skuid"].includes("pc")) {
      res.send(core.main.dancemachine_pc);
    }
    else if (req.headers["x-skuid"].includes("pc")) {
      res.send(core.main.dancemachine_nx);
    }
    else {
      res.send('Invalid Game')
    }
  });

  app.get('/content-authorization/v1/maps/*', (req, res) => {
    if (checkAuth(req, res)) {
      var maps = req.url.split("/").pop();
      const chunk = require('../../database/nohud/chunk.json');
      try {
        if (chunk[maps]) {
          var placeholder = core.CloneObject(require('../../database/nohud/placeholder.json'))
          placeholder.urls = chunk[maps]
          res.send(placeholder);
        } else {
          var placeholder = JSON.stringify(core.CloneObject(require('../../database/nohud/placeholder.json')))
          var placeholder = core.CloneObject(require('../../database/nohud/placeholder.json'))
          placeholder.urls = {}
          res.send(placeholder);
        }
      } catch (err) {
        console.error(err)
      }
    }

  });

  app.post("/carousel/:version/packages", (req, res) => {
    res.send(core.main.packages);
  });

  app.get("/com-video/v1/com-videos-fullscreen", (req, res) => {
    res.send([]);
  });

};
