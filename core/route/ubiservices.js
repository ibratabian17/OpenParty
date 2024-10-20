const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const core = {
    main: require('../var').main,
    CloneObject: require('../helper').CloneObject,
    generateCarousel: require('../carousel/carousel').generateCarousel,
    generateSweatCarousel: require('../carousel/carousel').generateSweatCarousel,
    generateCoopCarousel: require('../carousel/carousel').generateCoopCarousel,
    updateMostPlayed: require('../carousel/carousel').updateMostPlayed,
    signer: require('../lib/signUrl'),
    ipResolver: require('../lib/ipResolver'),
};
const { addUserId, updateUserTicket } = require('./account');
const settings = require('../../settings.json');
const cachedTicket = {};
const ipCache = {}; // Cache untuk menyimpan ticket berdasarkan IP

const prodwsurl = "https://public-ubiservices.ubi.com/";

// Replace placeholders in the object
const replaceDomainPlaceholder = (obj, domain) => {
    if (typeof obj === 'string') {
        return obj.replace('{SettingServerDomainVarOJDP}', domain);
    } else if (Array.isArray(obj)) {
        return obj.map(item => replaceDomainPlaceholder(item, domain));
    } else if (obj && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            acc[key] = replaceDomainPlaceholder(obj[key], domain);
            return acc;
        }, {});
    }
    return obj;
};

// Get client IP from request
const getClientIp = (req) => core.ipResolver.getClientIp(req);

// Placeholder function for getting the country based on IP
const getCountryFromIp = (ip) => 'US';

// Generate a fake ticket for fallback
const generateFalseTicket = () => {
    const start = "ew0KIC";
    const end = "KfQ==";
    const middleLength = 60;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let middle = '';

    for (let i = 0; i < middleLength; i++) {
        middle += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return start + middle + end;
};

// Initialize routes
exports.initroute = (app, express, server) => {

    // Serve application configuration
    app.get('/:version/applications/:appId/configuration', (req, res) => {
        res.send(core.main.configuration);
    });

    // Serve alternative application configuration
    app.get('/:version/applications/:appId', (req, res) => {
        res.send(core.main.configurationnx);
    });

    // Handle session creation
    app.post("/v3/profiles/sessions", async (req, res) => {
        const clientIp = getClientIp(req);
        const clientIpCountry = getCountryFromIp(clientIp);
    
        try {
            console.log("[ACC] Fetching Ticket From Official Server");
    
            // Modify headers by omitting the Host header
            const headers = { ...req.headers };
            delete headers.host;
    
            const response = await axios.post(`${prodwsurl}/v3/profiles/sessions`, req.body, { headers });
            res.send(response.data);
            addUserId(response.data.profileId, response.data.userId)
            updateUserTicket(response.data.profileId, `Ubi_v1 ${response.data.ticket}`)
            console.log("[ACC] Using Official Ticket");
        } catch (error) {
            console.log("[ACC] Error fetching from Ubisoft services", error.message);
            
            // Check if there's already a session for this IP
            if (ipCache[clientIp]) {
                console.log(`[ACC] Returning cached session cracked for IP ${clientIp}`);
                return res.send(ipCache[clientIp]);
            }

            // Fallback response in case Ubisoft service fails
            const sessionId = uuidv4();
            const now = new Date();
            const expiration = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
            const userTicket = generateFalseTicket();
            const profileId = uuidv4();
            cachedTicket[userTicket] = profileId;

            console.log('[ACC] Generating Fake Session for ', profileId);
    
            const sessionData = {
                platformType: "uplay",
                ticket: userTicket,
                twoFactorAuthenticationTicket: null,
                profileId,
                userId: profileId,
                nameOnPlatform: "NintendoSwitch",
                environment: "Prod",
                expiration: expiration.toISOString(),
                spaceId: uuidv4(),
                clientIp,
                clientIpCountry,
                serverTime: now.toISOString(),
                sessionId,
                sessionKey: "TqCz5+J0w9e8qpLp/PLr9BCfAc30hKlEJbN0Xr+mbZa=",
                rememberMeTicket: null,
            };

            // Cache the session based on the IP
            ipCache[clientIp] = sessionData;

            res.send(sessionData);
        }
    });
    
    // Handle session deletion
    app.delete("/v3/profiles/sessions", (req, res) => {
        res.send();
    });

    // Retrieve profiles based on query parameters
    app.get("/v3/profiles", (req, res) => {
        const profileId = `${cachedTicket[req.header('Authorization')] || 'UnknownTicket'}/userId/${req.query.idOnPlatform}`;
        res.send({
            profiles: [{
                profileId,
                userId: profileId,
                platformType: "uplay",
                idOnPlatform: profileId,
                nameOnPlatform: "Ryujinx"
            }]
        });
    });

    // Serve population data
    app.get("/v1/profiles/me/populations", (req, res) => {
        const spaceId = req.query.spaceIds || uuidv4();
        res.send({
            spaceId,
            data: {
                US_SDK_APPLICATION_BUILD_ID: "202007232022",
                US_SDK_DURABLES: []
            }
        });
    });

    // Serve application parameters for JD22
    app.get("/v1/applications/34ad0f04-b141-4793-bdd4-985a9175e70d/parameters", (req, res) => {
        res.send(replaceDomainPlaceholder(require("../../database/v1/parameters.json"), settings.server.domain));
    });

    // Serve application parameters for JD18
    app.get("/v1/spaces/041c03fa-1735-4ea7-b5fc-c16546d092ca/parameters", (req, res) => {
        res.send(replaceDomainPlaceholder(require("../../database/v1/parameters2.json"), settings.server.domain));
    });

    // Handle user-related requests (stubbed for now)
    app.post("/v3/users/:user", (req, res) => {
        res.send();
    });
};
