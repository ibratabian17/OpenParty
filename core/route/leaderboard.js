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

const secretKey = require('../../database/encryption.json').encrpytion.userEncrypt;
decryptedData = {};

function getWeekNumber() {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), 0, 1);
    const daysSinceStartOfWeek = Math.floor((now - startOfWeek) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysSinceStartOfWeek + 1) / 7);
}

const getGameVersion = (req) => {
    const sku = req.header('X-SkuId') || "jd2019-pc-ww";
    return sku.substring(0, 6) || "jd2019";
};

const initroute = (app) => {
    const fs = require('fs');

    app.get("/leaderboard/v1/maps/:mapName/:type", async (req, res) => {
        const { mapName } = req.params;
        const currentWeekNumber = getWeekNumber(); // Get the current week number

        switch (req.params.type) {
            case "dancer-of-the-week":
                try {
                    if (fs.existsSync(DOTW_PATH)) {
                        const data = fs.readFileSync(DOTW_PATH, 'utf-8');
                        const leaderboard = JSON.parse(data);

                        // Check if the map exists in the leaderboard
                        if (leaderboard[mapName] && leaderboard[mapName].length > 0) {
                            // Filter entries for the current week
                            const currentWeekEntries = leaderboard[mapName].filter(
                                entry => entry.weekOptain === currentWeekNumber
                            );

                            // Check if there are any entries for the current week
                            if (currentWeekEntries.length > 0) {
                                // Find the highest score entry for this map and current week
                                const highestEntry = currentWeekEntries.reduce((max, entry) =>
                                    entry.score > max.score ? entry : max
                                );

                                const dancerOfTheWeek = {
                                    "__class": "DancerOfTheWeek",
                                    "profileId": highestEntry.profileId,
                                    "score": highestEntry.score,
                                    "gameVersion": highestEntry.gameVersion || "jd2020",
                                    "rank": highestEntry.rank || 1,  // Since it's the highest, assign rank 1
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
                                // No entries for the current week, return default response
                                res.json({
                                    "__class": "DancerOfTheWeek",
                                    "gameVersion": "jd2019",
                                });
                            }
                        } else {
                            res.json({
                                "__class": "DancerOfTheWeek",
                                "gameVersion": "jd2019",
                            });
                        }
                    } else {
                        console.log('[ACC] Unable to find DOTW Files');
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
                break; // Ensure break is here

            case "friends":
                res.send({ __class: "LeaderboardList", entries: [] });
                break;

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

                            // Limit the sorted entries to the first 6
                            const topSixEntries = sortedEntries.slice(0, 6);
                            let rank = 0;

                            leaderboardData.entries = topSixEntries.map(entry => {
                                rank++;
                                const newLeaderboard = {
                                    "__class": "LeaderboardEntry_Online",
                                    "profileId": entry.profileId,
                                    "score": entry.score,
                                    "name": entry.name || entry.nickname,
                                    "avatar": entry.avatar,
                                    "rank": rank,
                                    "country": entry.country,
                                    "platformId": entry.platformId,
                                    "alias": entry.alias,
                                    "aliasGender": entry.aliasGender,
                                    "jdPoints": entry.jdPoints,
                                    "portraitBorder": entry.portraitBorder,
                                    "mapName": mapName
                                }
                                return newLeaderboard;
                            });
                        }
                    }

                    res.json(leaderboardData);
                } catch (error) {
                    console.error("Error:", error.message);
                    res.status(500).send("Internal Server Error");
                }
                break;
            }
        }
    });




};

module.exports = { initroute };
