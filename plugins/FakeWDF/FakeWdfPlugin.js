/**
 * WDF Plugin for OpenParty
 * Handles World Dance Floor (WDF) related routes as a plugin
 */
const axios = require('axios');
const Plugin = require('../../core/classes/Plugin'); // Assuming Plugin is located at ../core/classes/Plugin.js
const Logger = require('../../core/utils/logger');

class WDFPlugin extends Plugin {
    /**
     * Create a new WDF plugin
     */
    constructor() {
        super('WDFPlugin', 'Handles World Dance Floor (WDF) related routes for Just Dance.');
        this.logger = new Logger('WDFPlugin');

        // Bind handler methods to maintain 'this' context.
        // This is crucial when these methods are passed as callbacks to Express routes.
        this.handleAssignRoom = this.handleAssignRoom.bind(this);
        this.handleServerTime = this.handleServerTime.bind(this);
        this.handleScreens = this.handleScreens.bind(this);
        this.handleNewsfeed = this.handleNewsfeed.bind(this);
        this.handleOnlineBosses = this.handleOnlineBosses.bind(this);
        this.handleNextHappyHours = this.handleNextHappyHours.bind(this);
        this.handleGetNotification = this.handleGetNotification.bind(this);
        this.handlePostNotification = this.handlePostNotification.bind(this);
        this.handleGetSessionRecap = this.handleGetSessionRecap.bind(this);
        this.handlePostSessionRecap = this.handlePostSessionRecap.bind(this);
        this.handleGetScoreRecap = this.handleGetScoreRecap.bind(this);
        this.handlePostScoreRecap = this.handlePostScoreRecap.bind(this);
        this.handleGetOnlineRankWidget = this.handleGetOnlineRankWidget.bind(this);
        this.handlePostOnlineRankWidget = this.handlePostOnlineRankWidget.bind(this);
        this.handleGetSession = this.handleGetSession.bind(this);
        this.handlePostSession = this.handlePostSession.bind(this);
        this.handleGetCcu = this.handleGetCcu.bind(this);
        this.handleDeleteSession = this.handleDeleteSession.bind(this);
        this.handleGetTournamentScoreRecap = this.handleGetTournamentScoreRecap.bind(this);
        this.handlePostTournamentScoreRecap = this.handlePostTournamentScoreRecap.bind(this);
        this.handleGetTournamentUpdateScores = this.handleGetTournamentUpdateScores.bind(this);
        this.handlePostTournamentUpdateScores = this.handlePostTournamentUpdateScores.bind(this);
        this.handleWildcardGet = this.handleWildcardGet.bind(this);
        this.handleWildcardPost = this.handleWildcardPost.bind(this);

        // Initialize properties
        this.prodwsurl = "https://jmcs-prod.just-dance.com";
        this.FAKEWDF_ROOM = "FAKEWDF"; // Constant for the room ID

        this.fakerecap = {
            "uniquePlayerCount": 0,
            "countries": [
                "0"
            ],
            "__class": "SessionRecapInfo"
        };

        // Pre-load static JSON data if they are small and frequently accessed
        // IMPORTANT: Adjust these paths based on your actual project structure.
        // Assuming 'database' is a sibling directory to 'plugins' if this plugin is in 'plugins'
        this.assignRoomPcData = require("../../database/data/wdf/assign-room-pc.json");
        this.newsfeedData = require("../../database/data/wdf/newsfeed.json");
        this.nextHappyHoursData = require("../../database/data/wdf/next-happyhours.json");
    }

    /**
     * Initialize the plugin's routes
     * @param {Express} app - The Express application instance
     */
    initroute(app) {
        this.logger.info(`Initializing routes...`);

        // Register all the WDF routes using Express app methods directly
        app.post("/wdf/v1/assign-room", this.handleAssignRoom);
        app.get("/wdf/v1/server-time", this.handleServerTime);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/screens`, this.handleScreens);
        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/newsfeed`, this.handleNewsfeed);
        app.get("/wdf/v1/online-bosses", this.handleOnlineBosses);
        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/next-happyhours`, this.handleNextHappyHours);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/notification`, this.handleGetNotification);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/notification`, this.handlePostNotification);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/session-recap`, this.handleGetSessionRecap);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/session-recap`, this.handlePostSessionRecap);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/score-recap`, this.handleGetScoreRecap);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/score-recap`, this.handlePostScoreRecap);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/online-rank-widget`, this.handleGetOnlineRankWidget);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/online-rank-widget`, this.handlePostOnlineRankWidget);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/session`, this.handleGetSession);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/session`, this.handlePostSession);
        app.delete(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/session`, this.handleDeleteSession);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/ccu`, this.handleGetCcu);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/themes/tournament/score-recap`, this.handleGetTournamentScoreRecap);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/themes/tournament/score-recap`, this.handlePostTournamentScoreRecap);

        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/themes/tournament/update-scores`, this.handleGetTournamentUpdateScores);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/themes/tournament/update-scores`, this.handlePostTournamentUpdateScores);

        // Wildcard routes for forwarding requests to the official server
        app.get(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/*`, this.handleWildcardGet);
        app.post(`/wdf/v1/rooms/${this.FAKEWDF_ROOM}/*`, this.handleWildcardPost);

        this.logger.info(`Routes initialized`);
    }

    /**
     * Handle POST /wdf/v1/assign-room
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleAssignRoom(req, res) {
        res.send(this.assignRoomPcData);
    }

    /**
     * Handle GET /wdf/v1/server-time
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleServerTime(req, res) {
        res.send({
            "time": Date.now() / 1000
        });
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/screens
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleScreens(req, res) {
        res.send({
            "__class": "ScreenList",
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
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/newsfeed
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleNewsfeed(req, res) {
        res.send(this.newsfeedData);
    }

    /**
     * Handle GET /wdf/v1/online-bosses
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleOnlineBosses(req, res) {
        res.send({ __class: "OnlineBossDb", bosses: {} });
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/next-happyhours
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleNextHappyHours(req, res) {
        res.send(this.nextHappyHoursData);
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/notification
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetNotification(req, res) {
        res.send({ "__class": "Notification" });
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/notification
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePostNotification(req, res) {
        res.send({ "__class": "Notification" });
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/session-recap
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetSessionRecap(req, res) {
        res.send(this.fakerecap);
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/session-recap
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePostSessionRecap(req, res) {
        res.send(this.fakerecap);
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/score-recap
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetScoreRecap(req, res) {
        res.send({
            "__class": "RecapInfo",
            "currentRank": 1,
            "recapEntries": [{
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
            }],
            "totalPlayerCount": 1
        });
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/score-recap
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePostScoreRecap(req, res) {
        res.send({
            "__class": "RecapInfo",
            "currentRank": 1,
            "recapEntries": [{
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
            }],
            "totalPlayerCount": 1
        });
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/online-rank-widget
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetOnlineRankWidget(req, res) {
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
        });
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/online-rank-widget
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePostOnlineRankWidget(req, res) {
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
        });
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/session
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetSession(req, res) {
        res.send('OK');
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/session
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePostSession(req, res) {
        res.send('OK');
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/ccu
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetCcu(req, res) {
        res.send('0');
    }

    /**
     * Handle DELETE /wdf/v1/rooms/FAKEWDF/session
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleDeleteSession(req, res) {
        res.send('');
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/themes/tournament/score-recap
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetTournamentScoreRecap(req, res) {
        res.send({
            "__class": "RecapInfo",
            "currentRank": 1,
            "recapEntries": [{
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
            }],
            "totalPlayerCount": 1
        });
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/themes/tournament/score-recap
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePostTournamentScoreRecap(req, res) {
        res.send({
            "__class": "RecapInfo",
            "currentRank": 1,
            "recapEntries": [{
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
            }],
            "totalPlayerCount": 1
        });
    }

    /**
     * Handle GET /wdf/v1/rooms/FAKEWDF/themes/tournament/update-scores
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleGetTournamentUpdateScores(req, res) {
        res.send({
            "__class": "UpdateScoreResult",
            "currentRank": 1,
            "scoreEntries": [{
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
            }],
            "totalPlayerCount": 1
        });
    }

    /**
     * Handle POST /wdf/v1/rooms/FAKEWDF/themes/tournament/update-scores
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePostTournamentUpdateScores(req, res) {
        res.send({
            "__class": "UpdateScoreResult",
            "currentRank": 1,
            "scoreEntries": [{
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
            }],
            "totalPlayerCount": 1
        });
    }

    /**
     * Handle wildcard GET requests for WDF rooms, forwarding to official server.
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleWildcardGet(req, res) {
        try {
            const ticket = req.header("Authorization");
            const result = req.url; // This gets the full URL path including the FAKEWDF and additional path segments

            const response = await axios.get(this.prodwsurl + result, {
                headers: {
                    'X-SkuId': '',
                    'Authorization': ticket,
                    'Content-Type': 'application/json'
                }
            });

            res.send(response.data);
        } catch (error) {
            this.logger.error(`Wildcard GET error:`, error.message);
            res.status(error.response ? error.response.status : 500).send(error.message);
        }
    }

    /**
     * Handle wildcard POST requests for WDF rooms, forwarding to official server.
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleWildcardPost(req, res) {
        try {
            const ticket = req.header("Authorization");
            const result = req.url; // This gets the full URL path including the FAKEWDF and additional path segments

            const response = await axios.post(this.prodwsurl + result, req.body, {
                headers: {
                    'X-SkuId': '',
                    'Authorization': ticket,
                    'Content-Type': 'application/json'
                }
            });

            res.send(response.data);
        } catch (error) {
            this.logger.error(`Wildcard POST error:`, error.message);
            res.status(error.response ? error.response.status : 500).send(error.message);
        }
    }
}

// Export an instance of the plugin
module.exports = new WDFPlugin();
