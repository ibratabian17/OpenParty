console.log(`[LEADERBOARD] Initializing....`);

const fs = require("fs");
const axios = require("axios");
const path = require("path");
const core = {
    main: require('../var').main,
    CloneObject: require('../helper').CloneObject, getSavefilePath: require('../helper').getSavefilePath,
    generateCarousel: require('../carousel/carousel').generateCarousel, generateSweatCarousel: require('../carousel/carousel').generateSweatCarousel, generateCoopCarousel: require('../carousel/carousel').generateCoopCarousel, updateMostPlayed: require('../carousel/carousel').updateMostPlayed
}
const LEADERBOARD_PATH = path.join(core.getSavefilePath(), 'leaderboard/leaderboard.json');
const DOTW_PATH = path.join(core.getSavefilePath(), 'leaderboard/dotw.json');

const { getSavefilePath } = require('../helper');
const { encrypt, decrypt } = require('../lib/encryptor')

const secretKey = require('../../database/encryption.json').encrpytion.userEncrypt;
decryptedData = {};

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

const getGameVersion = (req) => {
    const sku = req.header('X-SkuId') || "jd2019-pc-ww";
    return sku.substring(0, 6) || "jd2019";
};

const initroute = (app) => {
    app.get("/leaderboard/v1/maps/:mapName/:type", async (req, res) => {
        const { mapName } = req.params;
        switch (req.params.type) {
            case "dancer-of-the-week":
                try {
                    if (fs.existsSync(DOTW_PATH)) {
                        const data = fs.readFileSync(DOTW_PATH, 'utf-8');
                        const leaderboard = JSON.parse(data);
    
                        // Check if the map exists in the leaderboard
                        if (leaderboard[mapName] && leaderboard[mapName].length > 0) {
                            // Find the highest score entry for this map
                            const highestEntry = leaderboard[mapName].reduce((max, entry) => entry.score > max.score ? entry : max);
    
                            const dancerOfTheWeek = {
                                "__class": "DancerOfTheWeek",
                                "profileId": highestEntry.profileId,
                                "score": highestEntry.score,
                                "gameVersion": highestEntry.gameVersion || "jd2020",
                                "rank": highestEntry.rank,  // Since it's the highest, assign rank 1
                                "name": highestEntry.name,
                                "avatar": highestEntry.avatar,
                                "country": highestEntry.country,
                                "platformId": highestEntry.platformId,
                                "alias": highestEntry.alias,
                                "aliasGender": highestEntry.aliasGender,
                                "jdPoints": highestEntry.jdPoints,
                                "portraitBorder": highestEntry.portraitBorder
                            };
    
                            res.json(dancerOfTheWeek);
                        } else {
                            res.json({
                                "__class": "DancerOfTheWeek",
                                "gameVersion": "jd2019",
                            });
                        }
                    } else {
                        console.log('[ACC] Unable to find DOTW Files')
                        // If leaderboard file does not exist, return default "NO DOTW" response
                        res.json({
                            "__class": "DancerOfTheWeek",
                            "gameVersion": "jd2019",
                        });
                    }
                } catch (error) {
                    console.error("Error:", error.message);
                    res.status(500).send("Internal Server Error");
                }
                break; // <--- Add this break
    
            case "friends":
                res.send({ __class: "LeaderboardList", entries: [] });
                break; // <--- Add this break
    
            case "world": {
                let leaderboardData = {
                    "__class": "LeaderboardList",
                    "entries": []
                };
    
                try {
                    // Read the leaderboard file
                    const leaderboardFilePath = LEADERBOARD_PATH;
                    if (fs.existsSync(leaderboardFilePath)) {
                        const data = fs.readFileSync(leaderboardFilePath, 'utf-8');
                        const leaderboard = JSON.parse(data);
    
                        // Check if there are entries for the mapName
                        if (leaderboard[mapName]) {
                            // Sort the leaderboard entries by score in descending order
                            const sortedEntries = leaderboard[mapName].sort((a, b) => b.score - a.score);
    
                            leaderboardData.entries = sortedEntries.map(entry => ({
                                "__class": "LeaderboardEntry_Online",
                                "profileId": entry.profileId,
                                "score": entry.score,
                                "name": entry.nickname,
                                "avatar": entry.avatar,
                                "country": entry.country,
                                "platformId": entry.platformId,
                                "alias": entry.alias,
                                "aliasGender": entry.aliasGender,
                                "jdPoints": entry.jdPoints,
                                "portraitBorder": entry.portraitBorder,
                                "mapName": mapName
                            }));
                        }
                    }
    
                    res.json(leaderboardData);
                } catch (error) {
                    console.error("Error:", error.message);
                    res.status(500).send("Internal Server Error");
                }
                break; // <--- Add this break
            }
        }
    });
    



};

module.exports = { initroute };
