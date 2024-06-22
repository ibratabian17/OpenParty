console.log(`[LEADERBOARD] Initializing....`);

const fs = require("fs");
const axios = require("axios");
const core = {
    main: require('../var').main,
    CloneObject: require('../helper').CloneObject,
    generateCarousel: require('../carousel/carousel').generateCarousel, generateSweatCarousel: require('../carousel/carousel').generateSweatCarousel, generateCoopCarousel: require('../carousel/carousel').generateCoopCarousel, updateMostPlayed: require('../carousel/carousel').updateMostPlayed
}
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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

    app.post("/profile/v2/map-ended", (req, res) => {
        var codename = req.body;
        for (let i = 0; i < codename.length; i++) {
            var song = codename[i];
            core.updateMostPlayed(song)
            if (fs.existsSync("./../../database/leaderboard/dotw/" + song.mapName + ".json")) {
                const readFile = fs.readFileSync(
                    "./../../database/leaderboard/dotw/" + song.mapName + ".json"
                );
                var JSONParFile = JSON.parse(readFile);
                if (JSONParFile.score > song.score) {
                    res.send(`1`);
                }
            } else {
                var ticket = req.header("Authorization");
                var xhr33 = new XMLHttpRequest();
                var sku = req.header('X-SkuId');
                var gameVer = sku.substring(0, 6);
                var prodwsurl = "https://prod.just-dance.com/"
                xhr33.open(req.method, prodwsurl + req.url, true);
                xhr33.setRequestHeader("X-SkuId", sku);
                xhr33.setRequestHeader("Authorization", ticket);
                xhr33.setRequestHeader("Content-Type", "application/json");
                xhr33.send(JSON.stringify(req.body), null, 2);
                var getprofil1 = xhr33.responseText.toString();
                for (let i = 0; i < getprofil1.length; i++) {
                    var profiljson = getprofil1[i];
                }

                console.log(profiljson)

                // Creates the local DOTW file
                var profiljson1 = JSON.parse(profiljson);
                console.log(profiljson1)
                var jsontodancerweek = {
                    __class: "DancerOfTheWeek",
                    score: song.score,
                    profileId: profiljson1.profileId,
                    gameVersion: gameVer,
                    rank: profiljson1.rank,
                    name: profiljson1.name,
                    avatar: profiljson1.avatar,
                    country: profiljson1.country,
                    platformId: profiljson1.platformId,
                    //"platformId": "2535467426396224",
                    alias: profiljson1.alias,
                    aliasGender: profiljson1.aliasGender,
                    jdPoints: profiljson1.jdPoints,
                    portraitBorder: profiljson1.portraitBorder,
                };
                fs.writeFile("./../../database/leaderboard/dotw/" + song.mapName + ".json", jsontodancerweek, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("DOTW file for" + song.mapName + "created!");
                    }
                }
                );
                res.send(profiljson);
            }
        }
    });

    app.get("/leaderboard/v1/maps/:map/dancer-of-the-week", (req, res) => {
        const checkFile = fs.existsSync("./../../database/leaderboard/dotw/" + req.params.map + ".json");
        if (checkFile) {
            const readFile = fs.readFile("./../../database/leaderboard/dotw/" + req.params.map + ".json");
            res.send(readFile);
        } else {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.send({
                "__class": "DancerOfTheWeek",
            });
        }
    });
};

module.exports = { initroute };
