//Game
console.log(`[UBISOURCE] Initializing....`)
const core = {
    main: require('../var').main,
    CloneObject: require('../helper').CloneObject,
    generateCarousel: require('../carousel/carousel').generateCarousel, generateSweatCarousel: require('../carousel/carousel').generateSweatCarousel, generateCoopCarousel: require('../carousel/carousel').generateCoopCarousel, updateMostPlayed: require('../carousel/carousel').updateMostPlayed,
    signer: require('../lib/signUrl')
}
const { v4: uuidv4 } = require('uuid');



exports.initroute = (app, express, server) => {
    const prodwsurl = "https://public-ubiservices.ubi.com/"
    
    app.get('/:version/applications/:appId/configuration', function (req, res) {
        res.send(core.main.configuration);
    });
    app.get('/:version/applications/:appId', function (req, res) {
        res.send(core.main.configurationnx);
    });

    app.post("/v3/profiles/sessions", async (req, res) => {
        const sessionId = uuidv4(); // Regenerate UUID for sessionId
        const now = new Date();
        const expiration = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

        // Retrieve client IP from request headers
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        // You can also retrieve client country from request headers or any other source

        res.send({
            "platformType": "uplay",
            "ticket": "ew0KICAidmVyIjogIjIiLA0KICAiYWlkIjogIjExMjM0NTY3LWNkMTMtNGU2My1hMzJkLWJhODFmZjRlYTc1NCIsDQogICJlbnYiOiAiU3RlYW0iLA0KICAic2lkIjogImI2MzQyMDdlLTQ3NjYtNGQwMS04M2UzLWQwYzg3Y2FhYmQxOSIsDQogICJ0eXBlIjogIlJlZnJlc2giLA0KICAiZW5jIjogIkpXVCIyNTYiLA0KICAiaXYiOiAic3YwSnlEb2MwQ1hCcF8wV3k2NU1nZz09IiwNCiAgImludCI6ICJIMzQ1Mzg1Ig0KfQ==",
            "twoFactorAuthenticationTicket": null,
            "profileId": "67e8e343-d535-4a6a-bb6e-315c5e028d31",
            "userId": "67e8e343-d535-4a6a-bb6e-315c5e028d31",
            "nameOnPlatform": "NintendoSwitch",
            "environment": "Prod",
            "expiration": expiration.toISOString(), // Convert expiration to ISO string
            "spaceId": "aaf29a36-17d3-4e69-b93c-7d535a0df492",
            "clientIp": clientIp, // Dynamic client IP
            "clientIpCountry": "ID", // Dynamic client country (You may replace "ID" with actual logic)
            "serverTime": now.toISOString(), // Set serverTime to current time
            "sessionId": sessionId,
            "sessionKey": "TqCz5+J0w9e8qpLp/PLr9BCfAc30hKlEJbN0Xr+mbZa=",
            "rememberMeTicket": null
        })
    });
    app.delete("/v3/profiles/sessions", (req, res) => {
        res.send()
    })

    app.get("/v3/profiles", (req, res) => {
        const profId = `67e8e343-d535-4a6a-bb6e-315c5e028d31/userId/${req.query.idOnPlataform}`
        res.send({
            "profiles": [{
                "profileId": profId,
                "userId": profId,
                "platformType": "uplay",
                "idOnPlatform": profId,
                "nameOnPlatform": "Ryujinx"
            }]
        })
    });

    app.get("/v1/profiles/me/populations", (req, res) => {
        const spaceId = `${req.query.spaceIds}/67e8e343-d535-4a6a-bb6e-315c5e028d31`
        res.send({
            "spaceId": spaceId,
            "data": {
                "US_SDK_APPLICATION_BUILD_ID": "202007232022",
                "US_SDK_DURABLES": []
            }
        })
    });

    app.get("/v1/applications/34ad0f04-b141-4793-bdd4-985a9175e70d/parameters", (req, res) => {
        res.send(require("../../database/v1/parameters.json"))
    });
    app.get("/v1/spaces/041c03fa-1735-4ea7-b5fc-c16546d092ca/parameters", (req, res) => {
        res.send(require("../../database/v1/parameters2.json"))
    });

    

    app.post("/v3/users/:user", (request, response) => {
        response.send();
    });
};
