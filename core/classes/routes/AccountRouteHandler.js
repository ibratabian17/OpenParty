/**
 * Account Route Handler for OpenParty
 * Handles user account-related routes
 */
const axios = require('axios');
const RouteHandler = require('./RouteHandler'); // Assuming RouteHandler is in the same directory
const { updateMostPlayed } = require('../../carousel/carousel'); // Adjust path as needed
const AccountService = require('../../services/AccountService'); // Import the AccountService
const { getDb } = require('../../database/sqlite');
const Logger = require('../../utils/logger');

class AccountRouteHandler extends RouteHandler {
    /**
     * Create a new account route handler
     */
    constructor() {
        super('AccountRouteHandler');
        this.logger = new Logger('AccountRouteHandler');

        // Bind handler methods to maintain 'this' context
        this.handlePostProfiles = this.handlePostProfiles.bind(this);
        this.handleGetProfiles = this.handleGetProfiles.bind(this);
        this.handleMapEnded = this.handleMapEnded.bind(this);
        this.handleDeleteFavoriteMap = this.handleDeleteFavoriteMap.bind(this);
        this.handleGetProfileSessions = this.handleGetProfileSessions.bind(this);
        this.handleFilterPlayers = this.handleFilterPlayers.bind(this);

        // Initialize properties
        this.ubiwsurl = "https://public-ubiservices.ubi.com";
        this.prodwsurl = "https://prod.just-dance.com";
    }

    /**
     * Initialize the routes
     * @param {Express} app - The Express application instance
     */
    initroute(app) {
        this.logger.info(`Initializing routes...`);

        // Register routes based on the 'old code'
        this.registerPost(app, "/profile/v2/profiles", this.handlePostProfiles);
        this.registerGet(app, "/profile/v2/profiles", this.handleGetProfiles);
        this.registerPost(app, "/profile/v2/map-ended", this.handleMapEnded);
        this.registerDelete(app, "/profile/v2/favorites/maps/:MapName", this.handleDeleteFavoriteMap);
        this.registerGet(app, "/v3/profiles/sessions", this.handleGetProfileSessions);
        this.registerPost(app, "/profile/v2/filter-players", this.handleFilterPlayers);

        this.logger.info(`Routes initialized`);
    }

    /**
     * Helper: Get the current week number
     * @returns {number} The current week number
     * @private
     */
    getWeekNumber() {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), 0, 1);
        const daysSinceStartOfWeek = Math.floor((now - startOfWeek) / (24 * 60 * 60 * 1000));
        return Math.ceil((daysSinceStartOfWeek + 1) / 7);
    }

    /**
     * Helper: Get game version from SkuId
     * @param {Request} req - The request object
     * @returns {string} The game version
     * @private
     */
    getGameVersion(req) {
        const sku = req.header('X-SkuId') || "jd2019-pc-ww";
        return sku.substring(0, 6) || "jd2019";
    }

    /**
     * Helper: Find user by ticket
     * @param {string} ticket - The user's ticket
     * @returns {string|null} Profile ID if found, null otherwise
     * @private
     */
    findUserFromTicket(ticket) {
        return AccountService.findUserFromTicket(ticket);
    }

    /**
     * Helper: Find user by nickname
     * @param {string} nickname - The user's nickname
     * @returns {Object|undefined} User profile if found, undefined otherwise
     * @private
     */
    findUserFromNickname(nickname) {
        return AccountService.findUserFromNickname(nickname);
    }

    /**
     * Helper: Add a new user profile.
     * @param {string} profileId - The unique ID for the user profile.
     * @param {Object} userProfile - The user profile data to add.
     * @private
     */
    addUser(profileId, userProfile) {
        this.logger.info(`Added User With UUID: `, profileId);
        return AccountService.updateUser(profileId, userProfile);
    }

    /**
     * Helper: Update or override existing user data.
     * @param {string} profileId - The ID of the profile to update.
     * @param {Object} userProfile - The data to merge into the existing profile.
     * @private
     */
    updateUser(profileId, userProfile) {
        return AccountService.updateUser(profileId, userProfile);
    }

    /**
     * Helper: Retrieve user data by profile ID.
     * @param {string} profileId - The ID of the profile to retrieve.
     * @returns {Object|null} The user profile data, or null if not found.
     * @private
     */
    getUserData(profileId) {
        return AccountService.getUserData(profileId);
    }

    /**
     * Helper: Read leaderboard data from SQLite.
     * @param {boolean} isDotw - True if reading Dancer of the Week leaderboard.
     * @returns {Promise<Object>} A promise that resolves to the leaderboard data.
     * @private
     */
    async readLeaderboard(isDotw = false) {
        const db = getDb();
        return new Promise((resolve, reject) => {
            const tableName = isDotw ? 'dotw' : 'leaderboard';
            db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                if (err) {
                    this.logger.error(`Error reading ${tableName} from DB:`, err.message);
                    reject(err);
                } else {
                    const data = {};
                    // For leaderboard, group by mapName
                    if (!isDotw) {
                        rows.forEach(row => {
                            if (!data[row.mapName]) {
                                data[row.mapName] = [];
                            }
                            data[row.mapName].push(row);
                        });
                    } else {
                        // For DOTW, assume a single entry per week or handle as needed
                        // For now, just return the rows as an array, or the first row if only one is expected
                        if (rows.length > 0) {
                            data.week = this.getWeekNumber(); // Assuming 'week' property is used to check current week
                            data.entries = rows;
                        }
                    }
                    resolve(data);
                }
            });
        });
    }

    /**
     * Helper: Generate a leaderboard object from user data.
     * This method is now primarily for transforming user data into a format suitable for leaderboard entries,
     * not for directly interacting with the database.
     * @param {Object} userDataList - All decrypted user profiles.
     * @param {Request} req - The request object (for getGameVersion).
     * @returns {Array} An array of leaderboard entries.
     * @private
     */
    generateLeaderboard(userDataList, req) {
        const leaderboardEntries = [];
        Object.entries(userDataList).forEach(([profileId, userProfile]) => {
            if (userProfile.scores) {
                Object.entries(userProfile.scores).forEach(([mapName, scoreData]) => {
                    leaderboardEntries.push({
                        mapName: mapName,
                        profileId: profileId,
                        username: userProfile.name, // Assuming 'name' is the username
                        score: scoreData.highest,
                        timestamp: scoreData.lastPlayed, // Using lastPlayed as timestamp
                        gameVersion: this.getGameVersion(req),
                        rank: userProfile.rank,
                        name: userProfile.name,
                        avatar: userProfile.avatar,
                        country: userProfile.country,
                        platformId: userProfile.platformId,
                        alias: userProfile.alias,
                        aliasGender: userProfile.aliasGender,
                        jdPoints: userProfile.jdPoints,
                        portraitBorder: userProfile.portraitBorder
                    });
                });
            }
        });
        this.logger.info('Leaderboard List Generated for processing.');
        return leaderboardEntries;
    }

    /**
     * Helper: Save leaderboard data to SQLite.
     * This method will now handle inserting/updating multiple leaderboard entries.
     * @param {Array} leaderboardEntries - An array of leaderboard entries to save.
     * @param {boolean} isDotw - True if saving Dancer of the Week leaderboard.
     * @returns {Promise<void>} A promise that resolves when data is saved.
     * @private
     */
    async saveLeaderboard(leaderboardEntries, isDotw = false) {
        const db = getDb();
        const tableName = isDotw ? 'dotw' : 'leaderboard';
        
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION;');
                
                let stmt;
                if (isDotw) {
                    stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (mapName, profileId, username, score, timestamp, gameVersion, rank, name, avatar, country, platformId, alias, aliasGender, jdPoints, portraitBorder, weekNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                } else {
                    stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (mapName, profileId, username, score, timestamp) VALUES (?, ?, ?, ?, ?)`);
                }
                
                const promises = leaderboardEntries.map(entry => {
                    return new Promise((resolveRun, rejectRun) => {
                        if (isDotw) {
                            stmt.run(
                                entry.mapName,
                                entry.profileId,
                                entry.username,
                                entry.score,
                                entry.timestamp,
                                entry.gameVersion,
                                entry.rank,
                                entry.name,
                                entry.avatar,
                                entry.country,
                                entry.platformId,
                                entry.alias,
                                entry.aliasGender,
                                entry.jdPoints,
                                entry.portraitBorder,
                                this.getWeekNumber(),
                                (err) => {
                                    if (err) rejectRun(err);
                                    else resolveRun();
                                }
                            );
                        } else {
                            stmt.run(
                                entry.mapName,
                                entry.profileId,
                                entry.username,
                                entry.score,
                                entry.timestamp,
                                (err) => {
                                    if (err) rejectRun(err);
                                    else resolveRun();
                                }
                            );
                        }
                    });
                });
                
                Promise.all(promises)
                    .then(() => {
                        stmt.finalize((err) => {
                            if (err) {
                                this.logger.error(`Error finalizing statement for ${tableName}:`, err.message);
                                db.run('ROLLBACK;');
                                reject(err);
                            } else {
                                db.run('COMMIT;', (commitErr) => {
                                    if (commitErr) {
                                        this.logger.error(`Error committing transaction for ${tableName}:`, commitErr.message);
                                        reject(commitErr);
                                    } else {
                                        this.logger.info(`Saved ${tableName} data to DB.`);
                                        resolve();
                                    }
                                });
                            }
                        });
                    })
                    .catch(error => {
                        this.logger.error(`Error during batch insert for ${tableName}:`, error.message);
                        db.run('ROLLBACK;');
                        reject(error);
                    });
            });
        });
    }

    /**
     * Handle POST to /profile/v2/profiles
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handlePostProfiles(req, res) {
        const profileId = req.body?.profileId || req.body?.userId;
        
        if (!profileId) {
            return res.status(400).send({ message: "Missing profileId or userId" });
        }
        
        const userData = await AccountService.getUserData(profileId); // Await getUserData
        
        if (userData) {
            this.logger.info(`Updating existing profile ${profileId}`);
            
            // Update only the fields present in the request body, preserving other fields
            const updatedProfile = await AccountService.updateUser(profileId, req.body); // Await updateUser
            
            return res.send({
                __class: "UserProfile",
                ...updatedProfile.toJSON()
            });
        } else {
            this.logger.info(`Creating new profile ${profileId}`);
            
            // Create a new profile with default values and request body values
            const newProfile = await AccountService.updateUser(profileId, { // Await updateUser
                ...req.body,
                name: req.body.name || "Player",
                alias: req.body.alias || "default",
                aliasGender: req.body.aliasGender || 2,
                scores: req.body.scores || {},
                songsPlayed: req.body.songsPlayed || [],
                avatar: req.body.avatar || "UI/menu_avatar/base/light.png",
                country: req.body.country || "US",
                createdAt: new Date().toISOString()
            });
            
            return res.send({
                __class: "UserProfile",
                ...newProfile.toJSON()
            });
        }
    }

    /**
     * Handle GET to /profile/v2/profiles
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleGetProfiles(req, res) {
        // Get the profileId from query parameters or authorization header
        const profileId = req.query.profileId || await this.findUserFromTicket(req.header('Authorization')); // Await findUserFromTicket
        
        if (!profileId) {
            return res.status(400).send({ message: "Missing profileId" });
        }
        
        const userProfile = await AccountService.getUserData(profileId); // Await getUserData
        
        if (!userProfile) {
            this.logger.info(`Profile ${profileId} not found`);
            return res.status(404).send({ message: "Profile not found" });
        }
        
        // If query contains specific profile requests by IDs
        if (req.query.requestedProfiles) {
            try {
                const requestedProfiles = JSON.parse(req.query.requestedProfiles);
                const profiles = {};
                
                // Get each requested profile
                for (const reqProfileId of requestedProfiles) {
                    const profile = await AccountService.getUserData(reqProfileId); // Await getUserData
                    if (profile) {
                        profiles[reqProfileId] = {
                            __class: "UserProfile",
                            ...profile.toJSON()
                        };
                    }
                }
                
                return res.send({
                    __class: "ProfilesContainer",
                    profiles: profiles
                });
            } catch (error) {
                this.logger.error('Error parsing requestedProfiles:', error);
                return res.status(400).send({ message: "Invalid requestedProfiles format" });
            }
        }
        
        // Return single profile
        return res.send({
            __class: "UserProfile",
            ...userProfile.toJSON()
        });
    }

    /**
     * Handle POST to /profile/v2/map-ended
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleMapEnded(req, res) {
        const { mapName, score } = req.body;
        const profileId = req.query.profileId || await this.findUserFromTicket(req.header('Authorization')); // Await findUserFromTicket
        
        if (!profileId) {
            return res.status(400).send({ message: "Missing profileId" });
        }
        
        if (!mapName || !score) {
            return res.status(400).send({ message: "Missing mapName or score" });
        }
        
        const userProfile = await AccountService.getUserData(profileId); // Await getUserData
        
        if (!userProfile) {
            this.logger.info(`Profile ${profileId} not found`);
            return res.status(404).send({ message: "Profile not found" });
        }
        
        // Update most played maps
        updateMostPlayed(mapName);
        
        // Update user's score for this map
        const currentScore = userProfile.scores?.[mapName]?.highest || 0;
        const newHighest = Math.max(currentScore, score);
        
        await AccountService.updateUserScore(profileId, mapName, { // Await updateUserScore
            highest: newHighest,
            lastPlayed: new Date().toISOString(),
            history: [
                ...(userProfile.scores?.[mapName]?.history || []),
                {
                    score,
                    timestamp: new Date().toISOString()
                }
            ].slice(-10) // Keep only last 10 scores
        });
        
        // Add to songsPlayed array if not already present
        if (!userProfile.songsPlayed?.includes(mapName)) {
            await AccountService.updateUser(profileId, { // Await updateUser
                songsPlayed: [...(userProfile.songsPlayed || []), mapName]
            });
        }
        
        // Update leaderboards
        const allAccounts = await AccountService.getAllAccounts();
        const leaderboardEntries = this.generateLeaderboard(allAccounts, req);
        await this.saveLeaderboard(leaderboardEntries);
        
        // Update DOTW (Dancer of the Week) leaderboard if it's a new week
        const currentWeek = this.getWeekNumber();
        const dotwData = await this.readLeaderboard(true);
        
        if (!dotwData.week || dotwData.week !== currentWeek) {
            this.logger.info(`New week detected: ${currentWeek}, resetting DOTW`);
            await this.saveLeaderboard([], true);
        }
        
        return res.send({
            __class: "MapEndResult",
            isNewPersonalBest: score > currentScore,
            personalBestScore: newHighest
        });
    }

    /**
     * Handle DELETE to /profile/v2/favorites/maps/:MapName
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleDeleteFavoriteMap(req, res) {
        const mapName = req.params.MapName;
        const profileId = req.query.profileId || this.findUserFromTicket(req.header('Authorization'));
        
        if (!profileId) {
            return res.status(400).send({ message: "Missing profileId" });
        }
        
        if (!mapName) {
            return res.status(400).send({ message: "Missing mapName" });
        }
        
        AccountService.removeMapFromFavorites(profileId, mapName);
        
        return res.status(204).send();
    }

    /**
     * Handle GET to /v3/profiles/sessions
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleGetProfileSessions(req, res) {
        const profileId = req.query.profileId || this.findUserFromTicket(req.header('Authorization'));
        
        if (!profileId) {
            return res.status(400).send({ message: "Missing profileId" });
        }
        
        const userProfile = AccountService.getUserData(profileId);
        
        if (!userProfile) {
            this.logger.info(`Profile ${profileId} not found`);
            return res.status(404).send({ message: "Profile not found" });
        }
        
        return res.send({
            sessionId: profileId,
            trackingEnabled: false
        });
    }

    /**
     * Handle POST to /profile/v2/filter-players
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    handleFilterPlayers(req, res) {
        const { count, countryFilter, platform } = req.body;
        const allAccounts = AccountService.getAllAccounts();
        
        // Filter accounts based on criteria
        const filteredAccounts = Object.values(allAccounts)
            .filter(account => {
                if (countryFilter && account.country !== countryFilter) {
                    return false;
                }
                if (platform && account.platformId !== platform) {
                    return false;
                }
                return true;
            })
            .slice(0, count || 10) // Limit to requested count or default 10
            .map(account => ({
                profileId: account.profileId,
                name: account.name,
                country: account.country,
                platformId: account.platformId,
                avatar: account.avatar
            }));
        
        return res.send({
            __class: "FilterPlayersResponse",
            players: filteredAccounts
        });
    }
}

module.exports = new AccountRouteHandler();
