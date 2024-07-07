var axios = require("axios");

function initroute(app) {
    var prodwsurl = "https://jmcs-prod.just-dance.com"
    app.post("/wdf/v1/assign-room", (req, res) => {
      res.send(require("../../database/wdf/assign-room-pc.json"));
    });
  
    app.get("/wdf/v1/server-time", (req, res) => {
      res.send({
        "time": Date.now() / 1000
      }
      );
    });
  
    app.post("/wdf/v1/rooms/PCJD2017/screens", (req, res) => {
      res.send({    "__class": "ScreenList",
      "screens": [{
        "__class": "Screen",
        "type": "in-game",
        "startTime": Date.now() / 1000,
        "endTime": (Date.now() / 1000) + 300,
        "theme": "vote",
        "mapName": "Despacito",
        "schedule": {
            "type": "probability",
            "theme": "MapVote",
            "occurance": {
                "next": (Date.now() / 1000) + 400,
                "prev": null
            }
        }
    }]
      });
    });
  
    app.get("wdf/v1/rooms/PCJD2017/newsfeed", (req, res) => {
      res.send(require("../../database/wdf/newsfeed.json"));
    });
  
    app.get("/wdf/v1/online-bosses", (req, res) => {
      res.send({ __class: "OnlineBossDb", bosses: {} });
    });
  
    app.get("/wdf/v1/rooms/PCJD2017/next-happyhours", (req, res) => {
      res.send(require("../../database/wdf/next-happyhours.json"));
    });
  
    var fakerecap = {
        "uniquePlayerCount": 0,
        "countries": [
          "0"
        ],
        "__class": "SessionRecapInfo"
      }
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/notification", (req, res) => {
        res.send({ "__class": "Notification" })
      });
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/notification", (req, res) => {
        res.send({ "__class": "Notification" })
      });
    
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/session-recap", (req, res) => {
        res.send(fakerecap)
      });
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/session-recap", (req, res) => {
        res.send(fakerecap)
      });
    
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/score-recap", (req, res) => {
        res.send({
          "__class": "RecapInfo",
          "currentRank": 1,
          "recapEntries": [
            {
              "name": "[BOT] WDF BOT",
              "avatar": 1,
              "country": 0,
              "skin": 1,
              "platform": "ps4",
              "portraitBorder": 0,
              "jdPoints": 13333,
              "tournamentBadge": true,
              "isSubscribed": true,
              "nameSuffix": 0,
              "__class": "RecapEntry",
              "pid": "00000000-0000-0000-0000-000000000000",
              "score": 1.000000
            }
          ],
          "totalPlayerCount": 1
        })
      });
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/score-recap", (req, res) => {
        res.send({
          "__class": "RecapInfo",
          "currentRank": 1,
          "recapEntries": [
            {
                "name": "[BOT] WDF BOT",
                "avatar": 1,
                "country": 0,
                "skin": 1,
                "platform": "ps4",
                "portraitBorder": 0,
                "jdPoints": 13333,
                "tournamentBadge": true,
                "isSubscribed": true,
                "nameSuffix": 0,
                "__class": "RecapEntry",
                "pid": "00000000-0000-0000-0000-000000000000",
                "score": 1.000000
              }
          ],
          "totalPlayerCount": 1
        })
      });
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/online-rank-widget", (req, res) => {
        res.send({
          "currentSeasonEndTime": 1714255200,
          "seasonNumber": 1,
          "currentSeasonDancerCount": 1,
          "previousSeasonWinner": {
            "wdfPoints": 0,
            "dc": {},
            "rank": 1,
            "__class": "WDFOnlineRankInfo"
          },
          "currentUserOnlineRankInfo": {
            "wdfPoints": 0,
            "dc": {},
            "rank": 1,
            "__class": "WDFOnlineRankInfo"
          },
          "__class": "OnlineRankWidgetInfo"
        })
      });
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/online-rank-widget", (req, res) => {
        res.send({
          "currentSeasonEndTime": 1714255200,
          "seasonNumber": 1,
          "currentSeasonDancerCount": 1,
          "previousSeasonWinner": {
            "wdfPoints": 0,
            "dc": {},
            "rank": 1,
            "__class": "WDFOnlineRankInfo"
          },
          "currentUserOnlineRankInfo": {
            "wdfPoints": 0,
            "dc": {},
            "rank": 1,
            "__class": "WDFOnlineRankInfo"
          },
          "__class": "OnlineRankWidgetInfo"
        })
      });
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/session", (req, res) => {
        res.send('OK')
      });
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/session", (req, res) => {
        res.send('OK')
      });
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/ccu", (req, res) => {
        res.send('0');
      });
    
      app.delete("/wdf/v1/rooms/" + "FAKEWDF" + "/session", (req, res) => {
        res.send('');
      });
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/themes/tournament/score-recap", (req, res) => {
        res.send({
          "__class": "RecapInfo",
          "currentRank": 1,
          "recapEntries": [
            {
              "name": "[BOT] WDF BOT",
              "avatar": 1,
              "country": 0,
              "skin": 1,
              "platform": "ps4",
              "portraitBorder": 0,
              "jdPoints": 13333,
              "tournamentBadge": true,
              "isSubscribed": true,
              "nameSuffix": 0,
              "__class": "RecapEntry",
              "pid": "00000000-0000-0000-0000-000000000000",
              "score": 1.000000
            }
          ],
          "totalPlayerCount": 1
        })
      });
    
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/themes/tournament/score-recap", (req, res) => {
        res.send({
          "__class": "RecapInfo",
          "currentRank": 1,
          "recapEntries": [
            {
              "name": "[BOT] WDF BOT",
              "avatar": 1,
              "country": 0,
              "skin": 1,
              "platform": "ps4",
              "portraitBorder": 0,
              "jdPoints": 13333,
              "tournamentBadge": true,
              "isSubscribed": true,
              "nameSuffix": 0,
              "__class": "RecapEntry",
              "pid": "00000000-0000-0000-0000-000000000000",
              "score": 1.000000
            }
          ],
          "totalPlayerCount": 1
        })
      });
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/themes/tournament/update-scores", (req, res) => {
        res.send({
          "__class": "UpdateScoreResult",
          "currentRank": 1,
          "scoreEntries": [
            {
              "name": "[BOT] WDF BOT",
              "avatar": 1,
              "country": 0,
              "skin": 1,
              "platform": "ps4",
              "portraitBorder": 0,
              "jdPoints": 13333,
              "tournamentBadge": true,
              "isSubscribed": true,
              "nameSuffix": 0,
              "__class": "ScoreEntry",
              "pid": "00000000-0000-0000-0000-000000000000",
              "score": 1.000000
            }
        ],
          "totalPlayerCount": 1
        })
      });
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/themes/tournament/update-scores", (req, res) => {
        res.send({
          "__class": "UpdateScoreResult",
          "currentRank": 1,
          "scoreEntries": [
            {
              "name": "[BOT] WDF BOT",
              "avatar": 1,
              "country": 0,
              "skin": 1,
              "platform": "ps4",
              "portraitBorder": 0,
              "jdPoints": 13333,
              "tournamentBadge": true,
              "isSubscribed": true,
              "nameSuffix": 0,
              "__class": "ScoreEntry",
              "pid": "00000000-0000-0000-0000-000000000000",
              "score": 1.000000
            }
          ],
          "totalPlayerCount": 1
        })
      });
    
      app.get("/wdf/v1/rooms/" + "FAKEWDF" + "/*", async (req, res) => {
        try {
          const ticket = req.header("Authorization");
          const result = req.url;  // This gets the full URL path including the FAKEWDF and additional path segments
      
          const response = await axios.get(prodwsurl + result, {
            headers: {
              'X-SkuId': '',
              'Authorization': ticket,
              'Content-Type': 'application/json'
            }
          });
      
          res.send(response.data);
        } catch (error) {
          res.status(error.response ? error.response.status : 500).send(error.message);
        }
      });
      
      app.post("/wdf/v1/rooms/" + "FAKEWDF" + "/*", async (req, res) => {
        try {
          const ticket = req.header("Authorization");
          const result = req.url;  // This gets the full URL path including the FAKEWDF and additional path segments
      
          const response = await axios.post(prodwsurl + result, req.body, {
            headers: {
              'X-SkuId': '',
              'Authorization': ticket,
              'Content-Type': 'application/json'
            }
          });
      
          res.send(response.data);
        } catch (error) {
          res.status(error.response ? error.response.status : 500).send(error.message);
        }
      });
      
  }
  module.exports = { initroute }