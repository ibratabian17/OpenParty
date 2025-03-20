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
const { addUserId, updateUserTicket, getUserData, updateUser } = require('./account');
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

const atob = (base64) => Buffer.from(base64, 'base64').toString('utf-8');
const parseCustomAuthHeader = (authorization) => {
    const [method, encoded] = authorization.split(" ");
    if (method !== "uplaypc_v1" || !encoded.includes("t=")) {
        return null;
    }

    // Ambil bagian setelah "t=" pertama saja
    const encodedPart = encoded.substring(encoded.indexOf("t=") + 2);

    // Decode Base64 setelah "t="
    const decoded = atob(encodedPart);
    const [tag, encodedProfileId, profileId, username, email, encodedPassword] = decoded.split(":");

    if (tag !== "JDParty") return null;

    return {
        profileId,
        username,
        email,
        password: atob(encodedPassword),
    };
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

        // Helper to generate session data
        const generateSessionData = (profileId, username, clientIp, clientIpCountry, ticket) => {
            const now = new Date();
            const expiration = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours

            const data = {
                platformType: "uplay",
                ticket,
                twoFactorAuthenticationTicket: null,
                profileId,
                userId: profileId,
                nameOnPlatform: username,
                environment: "Prod",
                expiration: expiration.toISOString(),
                spaceId: uuidv4(),
                clientIp,
                clientIpCountry,
                serverTime: now.toISOString(),
                sessionId: uuidv4(),
                sessionKey: "TqCz5+J0w9e8qpLp/PLr9BCfAc30hKlEJbN0Xr+mbZa=",
                rememberMeTicket: null,
            };
            return data;
        };

        // Remove Host header
        const headers = { ...req.headers };
        delete headers.host;

        const customAuthData = parseCustomAuthHeader(headers.authorization);

        if (customAuthData) {
            console.log("[ACC] CustomAuth detected, verifying...");

            const { profileId, username, email, password } = customAuthData;
            const userData = getUserData(profileId);
            const ticket = `CustomAuth${headers.authorization.split(" t=")[1]}`

            if (userData && userData.password && userData.email && userData.password === password) {
                console.log("[ACC] CustomAuth login: ", atob(username));
                updateUser(profileId, { username: atob(username), email, password, userId: profileId, ticket: `Ubi_v1 ${ticket}` });
                const sessionData = generateSessionData(profileId, username, clientIp, clientIpCountry, ticket)
                res.send(sessionData);
                return;
            } else if (!userData || !userData.password || !userData.email) {
                console.log("[ACC] CustomAuth register: ", atob(username));
                updateUser(profileId, { username: atob(username), email, password, userId: profileId, ticket: `Ubi_v1 ${ticket}` });
                res.send(generateSessionData(profileId, atob(username), clientIp, clientIpCountry, ticket));
                return;
            } else {
                console.log("[ACC] CustomAuth login, Invalid Credentials: ", atob(username));
            }
        }

        try {
            console.log("[ACC] Fetching Ticket From Official Server");
            const response = await axios.post(`${prodwsurl}/v3/profiles/sessions`, req.body, { headers });

            res.send(response.data);
            console.log("[ACC] Using Official Ticket");

            // Update user mappings
            addUserId(response.data.profileId, response.data.userId);
            updateUserTicket(response.data.profileId, `Ubi_v1 ${response.data.ticket}`);
        } catch (error) {
            console.log("[ACC] Error fetching from Ubisoft services", error.message);

            if (ipCache[clientIp]) {
                console.log(`[ACC] Returning cached session for IP ${clientIp}`);
                return res.send(ipCache[clientIp]);
            }

            const profileId = uuidv4();
            const userTicket = generateFalseTicket();
            cachedTicket[userTicket] = profileId;

            console.log("[ACC] Generating Fake Session for", profileId);

            const fakeSession = generateSessionData(profileId, "NintendoSwitch", clientIp, clientIpCountry, userTicket);
            ipCache[clientIp] = fakeSession;

            res.send(fakeSession);
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
