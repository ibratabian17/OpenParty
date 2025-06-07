/**
 * Carousel Route Handler for OpenParty
 * Handles carousel and related content routes
 */
const RouteHandler = require('./RouteHandler');
const CarouselService = require('../../services/CarouselService');
const coreMain = require('../../var').main; // Assuming core.main is needed for various carousel data
const Logger = require('../../utils/logger');
const AccountService = require('../../services/AccountService'); // Import AccountService to get profileId

class CarouselRouteHandler extends RouteHandler {
    constructor() {
        super('CarouselRouteHandler');
        this.logger = new Logger('CarouselRouteHandler');

        // Bind handler methods to maintain 'this' context
        this.handleCarousel = this.handleCarousel.bind(this);
        this.handleCarouselPages = this.handleCarouselPages.bind(this);
        this.handleUpsellVideos = this.handleUpsellVideos.bind(this);
    }

    /**
     * Initialize the routes
     * @param {Express} app - The Express application instance
     */
    initroute(app) {
        this.logger.info(`Initializing routes...`);

        // Carousel routes
        this.registerPost(app, "/carousel/v2/pages/avatars", this.handleCarousel);
        this.registerPost(app, "/carousel/v2/pages/dancerprofile", this.handleCarousel);
        this.registerPost(app, "/carousel/v2/pages/jdtv", this.handleCarousel);
        this.registerPost(app, "/carousel/v2/pages/jdtv-nx", this.handleCarousel);
        this.registerPost(app, "/carousel/v2/pages/quests", this.handleCarousel);
        this.registerPost(app, "/carousel/v2/pages/:mode", this.handleCarouselPages);
        this.registerPost(app, "/carousel/v2/pages/upsell-videos", this.handleUpsellVideos);

        this.logger.info(`Routes initialized`);
    }

    /**
     * Handle carousel requests for static data (avatars, dancerprofile, jdtv, quests)
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleCarousel(req, res) {
        const path = req.path.split('/').pop();
        switch (path) {
            case 'avatars':
                res.send(coreMain.avatars);
                break;
            case 'dancerprofile':
                res.send(coreMain.dancerprofile);
                break;
            case 'jdtv':
            case 'jdtv-nx':
                res.send(coreMain.jdtv);
                break;
            case 'quests':
                res.send(coreMain.quests);
                break;
            default:
                res.status(404).send('Not found');
        }
    }

    /**
     * Handle carousel pages requests for dynamic content (party, sweat, challenges)
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleCarouselPages(req, res) {
        let search = "";
        if (req.body.searchString && req.body.searchString != "") {
            search = req.body.searchString;
        } else if (req.body.searchTags && req.body.searchTags != undefined) {
            search = req.body.searchTags[0];
        }

        // Get profileId for personalization
        const profileId = req.query.profileId || await AccountService.findUserFromTicket(req.header('Authorization'));

        let action = null;
        let isPlaylist = false;

        switch (req.params.mode) {
            case "party":
            case "partycoop":
                action = "partyMap";
                break;
            case "sweat":
                action = "sweatMap";
                break;
            case "create-challenge":
                action = "create-challenge";
                break;
            case "jd2019-playlists":
            case "jd2020-playlists":
            case "jd2021-playlists":
            case "jd2022-playlists":
                isPlaylist = true;
                break;
        }

        if (isPlaylist) {
            // Assuming core.generatePlaylist is still needed for playlist categories
            // TODO: Potentially personalize playlists as well if needed in the future
            return res.json(require('../../lib/playlist').generatePlaylist().playlistcategory);
        }

        if (action != null) {
            // Pass profileId to generateCarousel for personalization
            return res.send(await CarouselService.generateCarousel(search, action, profileId));
        }
        
        return res.json({});
    }

    /**
     * Handle upsell videos requests
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleUpsellVideos(req, res) {
        res.send(coreMain.upsellvideos);
    }
}

module.exports = new CarouselRouteHandler();
