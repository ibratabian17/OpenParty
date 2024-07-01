console.log(`[LEADERBOARD] Initializing....`);

const fs = require("fs");
const axios = require("axios");
const path = require("path");
const core = {
    main: require('../var').main,
    CloneObject: require('../helper').CloneObject, getSavefilePath: require('../helper').getSavefilePath,
    generateCarousel: require('../carousel/carousel').generateCarousel, generateSweatCarousel: require('../carousel/carousel').generateSweatCarousel, generateCoopCarousel: require('../carousel/carousel').generateCoopCarousel, updateMostPlayed: require('../carousel/carousel').updateMostPlayed
}
const DOTW_PATH = path.join(core.getSavefilePath(), 'leaderboard/dotw/');

function generateToolNickname() {
    const prefixes = ["Wordkeeper", "Special", "Krakenbite", "DinosaurFan", "Definehub", "Termtracker", "Lexiconet", "Vocabvault", "Lingolink", "Glossarygenius", "Thesaurustech", "Synonymster", "Definitionary", "Jargonjot", "Idiomizer", "Phraseforge", "Meaningmaker", "Languageledger", "Etymologyengine", "Grammarguard", "Syntaxsense", "Semanticsearch", "Orthographix", "Phraseology", "Vernacularvault", "Dictionet", "Slangscroll", "Lingualist", "Grammargrid", "Lingoledge", "Termtoolbox", "Wordware", "Lexigizmo", "Synosearch", "Thesaurustech", "Phrasefinder", "Vocabvortex", "Meaningmatrix", "Languageledger", "Etymologist", "Grammargate", "Syntaxsphere", "Semanticsearch", "Orthographix", "Phraseplay", "Vernacularvault", "Dictionator", "Slangstack", "Lingolink", "Grammarguide", "Lingopedia", "Termtracker", "Wordwizard", "Lexilist", "Synomate", "Thesaurustool", "Definitizer", "Jargonjunction", "Idiomgenius", "Phrasemaker", "Meaningmate", "Duolingo", "Languagelink", "Etymoengine", "Grammarguru", "Syntaxsage", "Semanticsuite", "Orthography", "Phrasefinder", "Vocabverse", "Lexipedia", "Synoscribe", "Thesaurusware", "Definitionary", "Jargonscribe", "Idiomster", "Phrasetech", "Meaningmax", "Flop", "Slayguy", "Languagelex", "Etymoedge", "Grammargenie", "Syntaxsync", "Semanticsearch", "Orthography", "Phraseforge", "Vernacularex", "Dictionmaster", "Slangster", "Lingoware", "Grammargraph", "Lingomate", "Termmate", "Wordwork", "Lexixpert", "Synostar", "Thesaurusmax", "OculusVision", "FlowerPower", "RustySilver", "Underfire", "Shakeawake", "Truthhand", "Kittywake", "Definize", "Jargonize", "Idiomify", "Phrasemaster", "Meaningmark", "Lingualine", "Etymogenius", "Grammarguard", "Syntaxsmart", "Semanticsearch", "Orthography", "Phrasedex", "Vocabmax", "Lexilock", "Synomind", "Thesaurusmart", "Definify", "Jargonmatrix", "Idiomnet", "Phraseplay", "Meaningmate", "Lingolink", "Etymoexpert", "Grammargetter", "Syntaxsage", "Semanticsearch", "Orthography", "Phrasepad", "Vernacularvibe", "Dictiondom", "Slangster", "Lingolytics", "Grammargenie", "Lingotutor", "Termtracker", "Wordwarp", "Lexisync", "Synomind", "Thesaurusmate", "Definizer", "Jargonify", "Idiomster", "Phraselab", "Meaningmark", "Languageleaf", "Etymoedge", "Grammargrid", "Syntaxsync", "Semanticsuite", "Orthographix", "Phraseforge", "Vernacularvibe", "Dictiondom", "Slangster", "Lingolytics", "Grammargenie", "Lingotutor", "Termtracker", "Wordwarp", "Lexisync", "Synomind", "Thesaurusmate", "Definizer", "Jargonify", "Idiomster", "Phraselab", "Meaningmark", "Languageleaf", "Etymoedge", "Grammargrid", "Syntaxsync", "Semanticsuite", "Orthographix"];
    const suffixes = ["", "K", "Eja", "Guru", "Master", "Expert", "Ninja", "Pro", "Genius", "Champion", "Mega", "Super", "Ultra", "Ok", "Boomer"];
    const numbers = Math.floor(Math.random() * 10000); // Generate a random 4-digit number

    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    var name = "";
    if (Math.floor(Math.random() * 2) == 1) {
        return randomPrefix + numbers;
    } else {
        return randomSuffix + numbers;
    }

}

const getProfileData = async (req) => {
    try {
        const ticket = req.header("Authorization");
        const sku = req.header('X-SkuId');
        const prodwsurl = "https://prod.just-dance.com/";

        const response = await axios({
            method: req.method,
            url: prodwsurl + req.url,
            headers: {
                "X-SkuId": sku,
                "Authorization": ticket,
                "Content-Type": "application/json"
            },
            data: req.body
        });

        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`HTTP status ${error.response.status}`);
        } else if (error.request) {
            throw new Error('Network error');
        } else {
            throw new Error(error.message);
        }
    }
};

const getGameVersion = (req) => {
    const sku = req.header('X-SkuId');
    return sku.substring(0, 6);
};

const initroute = (app) => {
    app.post("/leaderboard/v1/maps/:mapName/friends", async (req, res) => {
        const { mapName } = req.params;

        let leaderboardData = {
            "__class": "LeaderboardList",
            "entries": []
        };

        try {
            leaderboardData.entries.push({
                "__class": "LeaderboardEntry_Online",
                "profileId": "00000000-0000-0000-0000-000000000000",
                "score": 13333,
                "name": ">:(",
                "avatar": 1,
                "country": 0,
                "platformId": "e3",
                "alias": 0,
                "aliasGender": 0,
                "jdPoints": 0,
                "portraitBorder": 0,
                "mapName": mapName
            });
            res.json(leaderboardData);
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get("/leaderboard/v1/maps/:mapName/countries/:country", async (req, res) => {
        const { mapName } = req.params;

        let leaderboardData = {
            "__class": "LeaderboardList",
            "entries": []
        };

        try {
            leaderboardData.entries.push(
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                });
            res.json(leaderboardData);
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get("/leaderboard/v1/maps/:mapName/world", async (req, res) => {
        const { mapName } = req.params;

        let leaderboardData = {
            "__class": "LeaderboardList",
            "entries": []
        };

        try {
            leaderboardData.entries.push(
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                },
                {
                    "__class": "LeaderboardEntry_Online",
                    "profileId": "00000000-0000-0000-0000-000000000000",
                    "score": Math.floor(Math.random() * 1333) + 12000,
                    "name": generateToolNickname(),
                    "avatar": Math.floor(Math.random() * 100),
                    "country": Math.floor(Math.random() * 20),
                    "platformId": "e3",
                    "alias": 0,
                    "aliasGender": 0,
                    "jdPoints": 0,
                    "portraitBorder": 0,
                    "mapName": mapName
                });
            res.json(leaderboardData);
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).send("Internal Server Error");
        }
    });

    app.post("/profile/v2/map-ended", async (req, res) => {
        const codename = req.body;

        try {
            for (let song of codename) {
                core.updateMostPlayed(song);

                const dotwFilePath = path.join(DOTW_PATH, `${song.mapName}.json`);
                if (fs.existsSync(dotwFilePath)) {
                    const readFile = fs.readFileSync(dotwFilePath, 'utf-8');
                    const JSONParFile = JSON.parse(readFile);
                    if (JSONParFile.score > song.score) {
                        return res.send('1');
                    }
                } else {
                    const profiljson1 = await getProfileData(req);
                    if (!profiljson1) {
                        return res.status(500).send('Error fetching profile data');
                    }

                    const jsontodancerweek = {
                        __class: "DancerOfTheWeek",
                        score: song.score,
                        profileId: profiljson1.profileId,
                        gameVersion: getGameVersion(req),
                        rank: profiljson1.rank,
                        name: profiljson1.name,
                        avatar: profiljson1.avatar,
                        country: profiljson1.country,
                        platformId: profiljson1.platformId,
                        alias: profiljson1.alias,
                        aliasGender: profiljson1.aliasGender,
                        jdPoints: profiljson1.jdPoints,
                        portraitBorder: profiljson1.portraitBorder,
                    };

                    fs.writeFileSync(dotwFilePath, JSON.stringify(jsontodancerweek, null, 2));
                    console.log(`DOTW file for ${song.mapName} created!`);
                    res.send(profiljson1);
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get("/leaderboard/v1/maps/:map/dancer-of-the-week", (req, res) => {
        const dotwFilePath = path.join(DOTW_PATH, `${req.params.map}.json`);
        if (fs.existsSync(dotwFilePath)) {
            const readFile = fs.readFileSync(dotwFilePath, 'utf-8');
            res.send(readFile);
        } else {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send({
                "__class": "DancerOfTheWeek",
                "profileId": "00000000-0000-0000-0000-000000000000",
                "score": 69,
                "gameVersion": "jd2019",
                "rank": 1,
                "name": "NO DOTW",
                "avatar": 1,
                "country": 0,
                "platformId": "3935074714266132752",
                "alias": 0,
                "aliasGender": 0,
                "jdPoints": 0,
                "portraitBorder": 0
            });
        }
    });
};

module.exports = { initroute };
