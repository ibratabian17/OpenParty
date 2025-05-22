/**
 * Default Route Handler for OpenParty
 * Handles default routes and game functionality
 */
const RouteHandler = require('./RouteHandler');
const requestCountry = require("request-country");
const settings = require('../../../settings.json');
const core = {
    main: require('../../var').main,
    generatePlaylist: require('../../lib/playlist').generatePlaylist,
    CloneObject: require('../../helper').CloneObject,
    loadJsonFile: require('../../helper').loadJsonFile,
    signer: require('../../lib/signUrl')
};
const ipResolver = require('../../lib/ipResolver');
const deployTime = Date.now();

class DefaultRouteHandler extends RouteHandler {
    constructor() {
        super('DefaultRouteHandler');
        
        // Load nohud list
const path = require('path');
        this.chunk = core.loadJsonFile('nohud/chunk.json', path.join(__dirname, '../../../database/data/nohud/chunk.json'));
        
        // Active users tracking
        this.activeUsers = {};
        
        // Bind handler methods to maintain 'this' context
        this.handlePackages = this.handlePackages.bind(this);
        this.handleSession = this.handleSession.bind(this);
        this.handleHome = this.handleHome.bind(this);
        this.handleAliases = this.handleAliases.bind(this);
        this.handlePlaylists = this.handlePlaylists.bind(this);
        this.handleCountry = this.handleCountry.bind(this);
        this.handleSubscription = this.handleSubscription.bind(this);
        this.handleQuests = this.handleQuests.bind(this);
        this.handleSessionQuest = this.handleSessionQuest.bind(this);
        this.handleItems = this.handleItems.bind(this);
        this.handleSkuConstants = this.handleSkuConstants.bind(this);
        this.handleDanceMachine = this.handleDanceMachine.bind(this);
        this.handleContentAuthorization = this.handleContentAuthorization.bind(this);
        this.handlePackagesV2 = this.handlePackagesV2.bind(this);
        this.handleComVideos = this.handleComVideos.bind(this);
        this.handlePing = this.handlePing.bind(this);
    }

    /**
     * Check if request is authorized
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {boolean} Whether the request is authorized
     * @private
     */
    checkAuth(req, res) {
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
            return false;
        }
    }

    /**
     * Reset timeout for active user
     * @param {string} ip - User's IP address
     * @param {string} platform - User's platform
     * @private
     */
    resetTimeout(ip, platform) {
        if (this.activeUsers[ip]) {
            clearTimeout(this.activeUsers[ip].timeout);
        }
        this.activeUsers[ip] = {
            timestamp: Date.now(),
            platform: platform || null,
            timeout: setTimeout(() => {
                delete this.activeUsers[ip];
            }, 20 * 60 * 1000) // 20 minutes
        };
    }

    /**
     * Initialize the routes
     * @param {Express} app - The Express application instance
     */
    initroute(app) {
        console.log(`[ROUTE] ${this.name} initializing routes...`);

        // Package routes
        this.registerGet(app, "/packages/v1/sku-packages", this.handlePackages);
        this.registerPost(app, "/carousel/:version/packages", this.handlePackagesV2);

        // Session routes
        this.registerPost(app, "/sessions/v1/session", this.handleSession);

        // Home and profile routes
        this.registerPost(app, "/home/v1/tiles", this.handleHome);
        this.registerGet(app, "/aliasdb/v1/aliases", this.handleAliases);
        this.registerGet(app, "/playlistdb/v1/playlists", this.handlePlaylists);
        this.registerGet(app, "/profile/v2/country", this.handleCountry);

        // Subscription and quest routes
        this.registerPost(app, "/subscription/v1/refresh", this.handleSubscription);
        this.registerGet(app, "/questdb/v1/quests", this.handleQuests);
        this.registerGet(app, "/session-quest/v1/", this.handleSessionQuest);

        // Item and customization routes
        this.registerGet(app, "/customizable-itemdb/v1/items", this.handleItems);
        this.registerGet(app, "/constant-provider/v1/sku-constants", this.handleSkuConstants);
        this.registerGet(app, "/dance-machine/v1/blocks", this.handleDanceMachine);

        // Content authorization route
        this.registerGet(app, "/content-authorization/v1/maps/*", this.handleContentAuthorization);

        // Video routes
        this.registerGet(app, "/com-video/v1/com-videos-fullscreen", this.handleComVideos);

        // Status route
        this.registerGet(app, "/status/v1/ping", this.handlePing);

        console.log(`[ROUTE] ${this.name} routes initialized`);
    }

    /**
     * Handle package requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePackages(req, res) {
        if (!this.checkAuth(req, res)) return;

        const skuId = req.header('X-SkuId');
        const skuPackages = core.main.skupackages;
        const platforms = ['wiiu', 'nx', 'pc', 'durango', 'orbis'];

        for (const platform of platforms) {
            if (skuId.includes(platform)) {
                res.send(skuPackages[platform]);
                return;
            }
        }
    }

    /**
     * Handle session requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleSession(req, res) {
        res.send({
            "pairingCode": "000000",
            "sessionId": "00000000-0000-0000-0000-000000000000",
            "docId": "0000000000000000000000000000000000000000"
        });
    }

    /**
     * Handle home requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleHome(req, res) {
        res.send(core.main.home);
    }

    /**
     * Handle aliases requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleAliases(req, res) {
        res.send(core.main.aliases);
    }

    /**
     * Handle playlists requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePlaylists(req, res) {
        res.send(core.generatePlaylist().playlistdb);
    }

    /**
     * Handle country requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleCountry(req, res) {
        let country = requestCountry(req);
        if (country == false) {
            country = "US";
        }
        res.send({ "country": country });
    }

    /**
     * Handle subscription requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleSubscription(req, res) {
        res.send(core.main.subscription);
    }

    /**
     * Handle quests requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleQuests(req, res) {
        const sku = req.header('X-SkuId');
        if (sku && sku.startsWith('jd2017-nx-all')) {
            res.send(core.main.questsnx);
        } else {
            res.send(core.main.questspc);
        }
    }

    /**
     * Handle session quest requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleSessionQuest(req, res) {
        res.send({
            "__class": "SessionQuestService::QuestData",
            "newReleases": []
        });
    }

    /**
     * Handle items requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleItems(req, res) {
        res.send(core.main.items);
    }

    /**
     * Handle SKU constants requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleSkuConstants(req, res) {
        res.send(core.main.block);
    }

    /**
     * Handle dance machine requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleDanceMachine(req, res) {
        if (req.header('X-SkuId').includes("pc")) {
            res.send(core.main.dancemachine_pc);
        } else if (req.header('X-SkuId').includes("nx")) {
            res.send(core.main.dancemachine_nx);
        } else {
            res.send('Invalid Game');
        }
    }

    /**
     * Handle content authorization requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleContentAuthorization(req, res) {
        if (!this.checkAuth(req, res)) return;

        const maps = req.url.split("/").pop();
        try {
            if (this.chunk[maps]) {
                const placeholder = core.CloneObject(require('../../../database/data/nohud/placeholder.json'));
                placeholder.urls = this.chunk[maps];
                res.send(placeholder);
            } else {
                const placeholder = core.CloneObject(require('../../../database/data/nohud/placeholder.json'));
                placeholder.urls = {};
                res.send(placeholder);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    }

    /**
     * Handle packages v2 requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePackagesV2(req, res) {
        res.send(core.main.packages);
    }

    /**
     * Handle com videos requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleComVideos(req, res) {
        res.send([]);
    }

    /**
     * Handle ping requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePing(req, res) {
        const ip = ipResolver.getClientIp(req);
        const platform = req.header('X-SkuId') || "unknown";
        this.resetTimeout(ip, platform);
        res.send([]);
    }
}

// Export an instance of the route handler
module.exports = new DefaultRouteHandler();
