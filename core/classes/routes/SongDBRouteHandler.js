/**
 * SongDB Route Handler for OpenParty
 * Handles song database and localization related routes
 */
const RouteHandler = require('./RouteHandler');
const settings = require('../../../settings.json');
const md5 = require('md5');
const signer = require('../../lib/signUrl');
const coreMain = require('../../var').main; // Assuming core.main is needed for songdb data

class SongDBRouteHandler extends RouteHandler {
    constructor() {
        super('SongDBRouteHandler');

        // Bind handler methods to maintain 'this' context
        this.handleSongdb = this.handleSongdb.bind(this);
        this.handleSongdbV2 = this.handleSongdbV2.bind(this);
        this.handlePrivateSongdb = this.handlePrivateSongdb.bind(this);
        this.handleLocalisation = this.handleLocalisation.bind(this);
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
     * Initialize the routes
     * @param {Express} app - The Express application instance
     */
    initroute(app) {
        console.log(`[ROUTE] ${this.name} initializing routes...`);

        // Song database routes
        this.registerGet(app, "/songdb/v1/songs", this.handleSongdb);
        this.registerGet(app, "/songdb/v2/songs", this.handleSongdbV2);
        this.registerGet(app, "/private/songdb/prod/:filename", this.handlePrivateSongdb);
        this.registerGet(app, "/songdb/v1/localisation", this.handleLocalisation);

        console.log(`[ROUTE] ${this.name} routes initialized`);
    }

    /**
     * Handle song database requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleSongdb(req, res) {
        if (!this.checkAuth(req, res)) return;

        const skuId = req.header('X-SkuId') || "jd2022-pc-ww";
        const year = skuId.match(/jd(\d{4})/i)?.[1];
        const platform = skuId.match(/-(pc|durango|orbis|nx|wiiu)/i)?.[1];
        const isParty = skuId.startsWith("openparty");
        const isDreynMOD = skuId.startsWith("jd2023pc-next") || skuId.startsWith("jd2024pc-next");
        const isPCParty = skuId.startsWith("JD2021PC") || skuId.startsWith("jd2022-pc");

        if (isParty && platform === 'pc') {
            res.send(coreMain.songdb['2017'].pcparty);
        } else if (isParty && platform === 'nx') {
            res.send(coreMain.songdb['2018'].nx);
        } else if (isDreynMOD) {
            res.send(coreMain.songdb['2017'].pcparty);
        } else if (isPCParty) {
            res.send(coreMain.songdb['2017'].pcparty);
        } else if (year && platform) {
            switch (year) {
                case '2017':
                    if (platform === 'pc' || platform === 'durango' || platform === 'orbis') {
                        res.send(coreMain.songdb['2017'].pc);
                    } else if (platform === 'nx') {
                        res.send(coreMain.songdb['2017'].nx);
                    }
                    break;
                case '2018':
                    if (platform === 'nx') {
                        res.send(coreMain.songdb['2018'].nx);
                    } else if (platform === 'pc') {
                        res.send(coreMain.songdb['2017'].pc);
                    }
                    break;
                case '2019':
                    if (platform === 'nx') {
                        res.send(coreMain.songdb['2019'].nx);
                    } else if (platform === 'wiiu') {
                        res.send(coreMain.songdb['2019'].wiiu);
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

    /**
     * Handle song database v2 requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleSongdbV2(req, res) {
        const sku = req.header('X-SkuId');
        const isHttps = settings.server.enableSSL ? "https" : "http";

        // Parse the SKU ID
        const skuParts = sku ? sku.split('-') : [];
        const version = parseInt(skuParts[0].replace('jd', ''));
        const platform = skuParts[1];

        // Generate URLs
        const songDBUrl = signer.generateSignedURL(`${isHttps}://${settings.server.domain}/private/songdb/prod/${sku}.${md5(JSON.stringify(coreMain.songdb[version][platform]))}.json`);
        const localizationDB = signer.generateSignedURL(`${isHttps}://${settings.server.domain}/private/songdb/prod/localisation.${md5(JSON.stringify(coreMain.localisation))}.json`);

        // Send response
        res.send({
            "requestSpecificMaps": require('../../../database/data/db/requestSpecificMaps.json'),
            "localMaps": [],
            "songdbUrl": songDBUrl,
            "localisationUrl": localizationDB
        });
    }

    /**
     * Handle private song database requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handlePrivateSongdb(req, res) {
        if (!signer.verifySignedURL(req.originalUrl)) {
            return res.status(401).send('Unauthorized');
        }

        if (req.path.split('/')[4].startsWith('localisation')) {
            return res.send(coreMain.localisation);
        }

        const filename = req.path.split('/')[4].split('.')[0];
        const sku = filename.split('.')[0];

        if (!sku) {
            return res.status(400).send({
                'error': 400,
                'message': 'You are not permitted to receive a response'
            });
        }

        // Parse the SKU ID
        const skuParts = sku.split('-');
        const version = parseInt(skuParts[0].replace('jd', ''));
        const platform = skuParts[1];

        if (coreMain.songdb[version] && coreMain.songdb[version][platform]) {
            res.send(coreMain.songdb[version][platform]);
        } else {
            res.status(404).send({
                'error': 404,
                'message': 'Song database not found for the given version and platform'
            });
        }
    }

    /**
     * Handle localization requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleLocalisation(req, res) {
        res.send(coreMain.localisation);
    }
}

module.exports = new SongDBRouteHandler();
