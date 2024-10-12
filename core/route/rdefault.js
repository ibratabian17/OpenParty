//Game
console.log(`[DEFROUTE] Initializing....`)
var requestCountry = require("request-country");
const settings = require('../../settings.json');
var md5 = require('md5');
const core = {
  main: require('../var').main,
  generatePlaylist: require('../lib/playlist').generatePlaylist,
  CloneObject: require('../helper').CloneObject,
  loadJsonFile: require('../helper').loadJsonFile,
  generateCarousel: require('../carousel/carousel').generateCarousel, generateSweatCarousel: require('../carousel/carousel').generateSweatCarousel, generateCoopCarousel: require('../carousel/carousel').generateCoopCarousel, updateMostPlayed: require('../carousel/carousel').updateMostPlayed,
  signer: require('../lib/signUrl')
}
const path = require('path');
const signer = require('../lib/signUrl')
const ipResolver = require('../lib/ipResolver')
const deployTime = Date.now()

//load nohud list
const chunk = core.loadJsonFile('nohud/chunk.json', '../database/nohud/chunk.json');

function checkAuth(req, res) {
  if (req.header('X-SkuId')) {
    if (!(req.header('X-SkuId').startsWith("jd") || req.header('X-SkuId').startsWith("JD")) || !req.headers["authorization"].startsWith("Ubi")) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      res.status(400).send({
        'error': 400,
        'message': 'Bad request! Oops you didn\'t specify what file should we give you, try again'
      });
      return false;
    }
    return true;
  } else {
    res.status(400).send({
      'error': 400,
      'message': 'Oopsie! We can\'t check that ur Request is valid',
      'headder': req.headers
    });
  }
}

function returnSongdb(input, res) {
  const songdb = core.main.songdb;
  const year = input.match(/jd(\d{4})/i)?.[1];
  const platform = input.match(/-(pc|durango|orbis|nx|wiiu)/i)?.[1];
  const isParty = input.startsWith("openparty");
  const isDreynMOD = input.startsWith("jd2023pc-next") || input.startsWith("jd2024pc-next");
  const isPCParty = input.startsWith("JD2021PC") || input.startsWith("jd2022-pc");

  if (isParty && platform === 'pc') {
    res.send(songdb['2017'].pcparty);
  } else if (isParty && platform === 'nx') {
    res.send(songdb['2018'].nx);
  } else if (isDreynMOD) {
    res.send(songdb['2017'].pcparty);
  } else if (isPCParty) {
    res.send(songdb['2017'].pcparty);
  } else if (year && platform) {
    switch (year) {
      case '2017':
        if (platform === 'pc' || platform === 'durango' || platform === 'orbis') {
          res.send(songdb['2017'].pc);
        } else if (platform === 'nx') {
          res.send(songdb['2017'].nx);
        }
        break;
      case '2018':
        if (platform === 'nx') {
          res.send(songdb['2018'].nx);
        } else if (platform === 'pc') {
          res.send(songdb['2017'].pc);
        }
        break;
      case '2019':
        if (platform === 'nx') {
          res.send(songdb['2019'].nx);
        } else if (platform === 'wiiu') {
          res.send(songdb['2019'].wiiu);
        }
        break;
      default:
        res.send('Invalid Game');
        break;
    }
  } else {
    res.send('Invalid Game');
  }
}

const activeUsers = {};
const resetTimeout = (ip, platform) => {
  if (activeUsers[ip]) {
    clearTimeout(activeUsers[ip].timeout);
  }
  activeUsers[ip] = {
    timestamp: Date.now(),
    platform: platform || null, // Store platform if it exists, otherwise null
    timeout: setTimeout(() => {
      delete activeUsers[ip];
    }, 20 * 60 * 1000) // 20 minutes
  };
};


exports.initroute = (app, express, server) => {
  app.get("/songdb/v1/songs", (req, res) => {
    if (checkAuth(req, res)) {
      returnSongdb(req.header('X-SkuId'), res);
    }
  });

  app.get("/songdb/v2/songs", (req, res) => {
    var sku = req.header('X-SkuId');
    var isHttps = settings.server.enableSSL ? "https" : "http";

    // Parse the SKU ID
    var skuParts = sku ? sku.split('-') : [];
    var version = parseInt(skuParts[0].replace('jd', '')); // Example: jd2020 -> 2020
    var platform = skuParts[1]; // Example: nx

    // Generate URLs
    const songDBUrl = signer.generateSignedURL(`${isHttps}://${settings.server.domain}/private/songdb/prod/${sku}.${md5(JSON.stringify(core.main.songdb[version][platform]))}.json`);
    const localizationDB = signer.generateSignedURL(`${isHttps}://${settings.server.domain}/private/songdb/prod/localisation.${md5(JSON.stringify(core.main.localisation))}.json`);

    // Send response
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
        var filename = req.path.split('/')[4].split('.')[0];
        var sku = filename.split('.')[0];
        if (sku) {
          // Parse the SKU ID
          var skuParts = sku.split('-');
          var version = parseInt(skuParts[0].replace('jd', '')); // Example: jd2020 -> 2020
          var platform = skuParts[1]; // Example: nx

          if (core.main.songdb[version] && core.main.songdb[version][platform]) {
            res.send(core.main.songdb[version][platform]);
          } else {
            res.status(404).send({
              'error': 404,
              'message': 'Song database not found for the given version and platform'
            });
          }
        } else {
          res.status(400).send({
            'error': 400,
            'message': 'You are not permitted to receive a response'
          });
        }
      }
    } else {
      res.status(401).send('Unauthorized');
    }
  });

  app.get('/packages/v1/sku-packages', function (req, res) {
    if (checkAuth(req, res)) {
      const skuId = req.header('X-SkuId');
      const skuPackages = core.main.skupackages;

      const platforms = ['wiiu', 'nx', 'pc', 'durango', 'orbis'];

      for (const platform of platforms) {
        if (skuId.includes(platform)) {
          res.send(skuPackages[platform]);
          return; // Exit the function once the response is sent
        }
      }
    }
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
    response.send(core.generatePlaylist().playlistdb);
  });
  app.post("/carousel/v2/pages/:mode", (req, res) => {
    var search = ""
    if (req.body.searchString && req.body.searchString != "") {
        search = req.body.searchString
    } else if (req.body.searchTags && req.body.searchTags != undefined) {
        search = req.body.searchTags[0]
    } else {
        search = ""
    }

    let action = null
    let isPlaylist = false

    switch (req.params.mode) {
        case "party":
        case "partycoop":
            action = "partyMap"
            break

        case "sweat":
            action = "sweatMap"
            break

        case "create-challenge":
            action = "create-challenge"
            break

        case "jd2019-playlists":
        case "jd2020-playlists":
        case "jd2021-playlists":
        case "jd2022-playlists":
            isPlaylist = true
            break
    }

    if (isPlaylist) return res.json(core.generatePlaylist().playlistcategory)

    if (action != null)
        return res.send(core.CloneObject(core.generateCarousel(search, action)))
    else return res.json({})
});

  app.get("/profile/v2/country", function (request, response) {
    var country = requestCountry(request);
    if (country == false) {
      country = "US";
    }
    response.send({ "country": country });
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
    if (req.header('X-SkuId').includes("pc")) {
      res.send(core.main.dancemachine_pc);
    }
    else if (req.header('X-SkuId').includes("pc")) {
      res.send(core.main.dancemachine_nx);
    }
    else {
      res.send('Invalid Game')
    }
  });

  app.get('/content-authorization/v1/maps/*', (req, res) => {
    if (checkAuth(req, res)) {
      var maps = req.url.split("/").pop();
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

  // Add ServerStats
  app.get("/status/v1/ping", (req, res) => {
    const ip = ipResolver.getClientIp(req);
    const platform = req.header('X-SkuId') || "unknown";
    resetTimeout(ip, platform);
    res.send([]);
  });

  app.get("/status/v1/serverstats", (req, res) => {
    const activeUserCount = Object.keys(activeUsers).length;
    let platformCounts = { pc: 0, nx: 0, wiiu: 0, ps4: 0, x1: 0, unknown: 0 };

    // Iterate over activeUsers to count platforms
    for (const user of Object.values(activeUsers)) {
      if (user.platform.includes('pc')) {
        platformCounts.pc += 1;
      } else if (user.platform.includes('nx')) {
        platformCounts.nx += 1;
      } else if (user.platform.includes('wiiu')) {
        platformCounts.wiiu += 1;
      } else if (user.platform.includes('ps4')) {
        platformCounts.ps4 += 1;
      } else if (user.platform.includes('x1')) {
        platformCounts.x1 += 1;
      } else if (user.platform.includes('unknown')) {
        platformCounts.unknown += 1;
      }
    }

    res.send({
      status: true,
      onlineUser: activeUserCount,
      deployTime: deployTime,
      currentOnlinePlatform: platformCounts
    });
  });

};
