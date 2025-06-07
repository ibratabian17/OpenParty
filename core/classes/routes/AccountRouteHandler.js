/**
 * Account Route Handler for OpenParty
 * Handles user account-related routes
 */
const axios = require('axios');
const RouteHandler = require('./RouteHandler'); // Assuming RouteHandler is in the same directory
const MostPlayedService = require('../../services/MostPlayedService');
const AccountService = require('../../services/AccountService'); // Import the AccountService
const { getDb } = require('../../database/sqlite');
const Logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating new profile IDs

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
     * Helper: Read the last reset week from the database.
     * @returns {Promise<number>} The last reset week number.
     * @private
     */
    async readLastResetWeek() {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.get('SELECT value FROM config WHERE key = ?', ['last_reset_week'], (err, row) => {
                if (err) {
                    this.logger.error(`Error reading last_reset_week from DB: ${err.message}`);
                    reject(err);
                } else {
                    resolve(row ? parseInt(row.value, 10) : 0); // Default to 0 if not found
                }
            });
        });
    }

    /**
     * Helper: Write the current week to the database.
     * @param {number} weekNumber - The current week number.
     * @returns {Promise<void>}
     * @private
     */
    async writeLastResetWeek(weekNumber) {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.run('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', ['last_reset_week', weekNumber.toString()], (err) => {
                if (err) {
                    this.logger.error(`Error writing last_reset_week to DB: ${err.message}`);
                    reject(err);
                } else {
                    this.logger.info(`Updated last_reset_week in DB to week ${weekNumber}`);
                    resolve();
                }
            });
        });
    }

    /**
     * Helper: Clear all entries from the main leaderboard table.
     * @returns {Promise<void>} A promise that resolves when the table is cleared.
     * @private
     */
    async clearLeaderboard() {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM leaderboard', [], (err) => {
                if (err) {
                    this.logger.error(`Error clearing leaderboard table:`, err.message);
                    reject(err);
                } else {
                    this.logger.info(`Cleared leaderboard table.`);
                    resolve();
                }
            });
        });
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
                        // For DOTW, return the week number of the first entry if available
                        // and all entries.
                        if (rows.length > 0) {
                            data.week = rows[0].weekNumber; // Assuming weekNumber is stored in the row
                            data.entries = rows;
                        } else {
                            data.week = null;
                            data.entries = [];
                        }
                    }
                    resolve(data);
                }
            });
        });
    }

    /**
     * Helper: Clear all entries from the dotw leaderboard table.
     * @returns {Promise<void>} A promise that resolves when the table is cleared.
     * @private
     */
    async clearDotwLeaderboard() {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM dotw', [], (err) => {
                if (err) {
                    this.logger.error(`Error clearing dotw table:`, err.message);
                    reject(err);
                } else {
                    this.logger.info(`Cleared dotw table.`);
                    resolve();
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
                    stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (
                        mapName, profileId, username, score, timestamp, name, 
                        gameVersion, rank, avatar, country, platformId, 
                        alias, aliasGender, jdPoints, portraitBorder
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
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
                                entry.name,
                                entry.gameVersion,
                                entry.rank,
                                entry.avatar,
                                entry.country,
                                entry.platformId,
                                entry.alias,
                                entry.aliasGender,
                                entry.jdPoints,
                                entry.portraitBorder,
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
        const authHeader = req.header('Authorization');
        const ticket = authHeader ? authHeader : null; // Keep the full header as ticket

        if (!ticket) {
            this.logger.warn(`POST /profile/v2/profiles: Missing Authorization header (ticket).`);
            return res.status(400).send({ message: "Missing Authorization header (ticket)." });
        }

        const profileId = await AccountService.findUserFromTicket(ticket);

        if (!profileId) {
            this.logger.warn(`POST /profile/v2/profiles: Profile not found for provided ticket.`);
            return res.status(400).send({ message: "Profile not found for provided ticket." });
        }

        let userData = await AccountService.getUserData(profileId);

        if (userData) {
            this.logger.info(`Updating existing profile ${profileId}`);
            
            // Update only the fields present in the request body, preserving other fields
            // Ensure the ticket is updated if present in the header
            const updateData = { ...req.body };
            updateData.ticket = ticket; // Always update ticket from header
            const updatedProfile = await AccountService.updateUser(profileId, updateData);
            
            return res.send({
                __class: "UserProfile",
                ...updatedProfile.toPublicJSON()
            });
        } else {
            // This case should ideally not be reached if profileId is always found via ticket
            // However, if it is, it means a ticket was provided but no profile exists for it.
            // As per previous instruction, we should not create a new profile here.
            this.logger.error(`POST /profile/v2/profiles: Unexpected state - profileId found via ticket but no existing user data.`);
            return res.status(400).send({ message: "Profile not found for provided ticket." });
        }
    }

    /**
     * Handle GET to /profile/v2/profiles
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleGetProfiles(req, res) {
        const profileIdsParam = req.query.profileIds;

        if (profileIdsParam) {
            try {
                const requestedProfileIds = profileIdsParam.split(',');
                const profiles = [];

                for (const reqProfileId of requestedProfileIds) {
                    const profile = await AccountService.getUserData(reqProfileId);
                    if (profile) {
                        profiles.push({
                            __class: "UserProfile",
                            ...profile.toPublicJSON()
                        });
                    } else {
                        profiles.push({
                            profileId: reqProfileId,
                            isExisting: false
                        });
                    }
                }
                return res.send(profiles);
            } catch (error) {
                this.logger.error('Error processing profileIds:', error);
                return res.status(400).send({ message: "Invalid profileIds format" });
            }
        }

        // Fallback for single profile request or if profileIds is not present
        const profileId = req.query.profileId || await this.findUserFromTicket(req.header('Authorization'));

        if (!profileId) {
            return res.status(400).send({ message: "Missing profileId" });
        }

        const userProfile = await AccountService.getUserData(profileId);

        if (!userProfile) {
            this.logger.info(`Profile ${profileId} not found`);
            return res.status(404).send({ message: "Profile not found" });
        }

        return res.send({
            __class: "UserProfile",
            ...userProfile.toPublicJSON()
        });
    }

    /**
     * Handle POST to /profile/v2/map-ended
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     */
    async handleMapEnded(req, res) {
        const { mapName, score } = req.body;
        const profileId = req.query.profileId || await this.findUserFromTicket(req.header('Authorization'));
        
        if (!profileId) {
            return res.status(400).send({ message: "Missing profileId" });
        }
        
        if (!mapName || !score) {
            return res.status(400).send({ message: "Missing mapName or score" });
        }
        
        const userProfile = await AccountService.getUserData(profileId);
        
        if (!userProfile) {
            this.logger.info(`Profile ${profileId} not found`);
            return res.status(404).send({ message: "Profile not found" });
        }
        
        // Perform weekly leaderboard reset check
        const currentWeek = this.getWeekNumber();
        const lastResetWeek = await this.readLastResetWeek();

        if (currentWeek !== lastResetWeek) {
            this.logger.info(`New week detected: ${currentWeek}. Resetting all leaderboards.`);
            await this.clearLeaderboard(); // Clear main leaderboard
            await this.clearDotwLeaderboard(); // Clear DOTW leaderboard
            await this.writeLastResetWeek(currentWeek); // Update last reset week
        }
        
        // Update most played maps
        await MostPlayedService.updateMostPlayed(mapName);
        
        // Update user's score for this map
        const currentScore = userProfile.scores?.[mapName]?.highest || 0;
        const newHighest = Math.max(currentScore, score);
        
        await AccountService.updateUserScore(profileId, mapName, {
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
            await AccountService.updateUser(profileId, {
                songsPlayed: [...(userProfile.songsPlayed || []), mapName]
            });
        }
        
        // Update leaderboards (main and DOTW)
        const allAccounts = await AccountService.getAllAccounts();
        const leaderboardEntries = this.generateLeaderboard(allAccounts, req);
        await this.saveLeaderboard(leaderboardEntries); // Save to main leaderboard
        
        // Save current map's score to DOTW
        await this.saveLeaderboard([
            {
                mapName: mapName,
                profileId: profileId,
                username: userProfile.name,
                score: newHighest,
                timestamp: new Date().toISOString(),
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
            }
        ], true); // Save to DOTW leaderboard
        
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
        
        const clientIp = req.ip; // Get client IP
        const authHeader = req.header('Authorization');
        const ticket = authHeader ? authHeader.split(' ')[1] : null; // Extract ticket from "Ubi_v1 <ticket>"

        // Determine platformType from X-SkuId
        const skuId = req.header('X-SkuId') || '';
        let platformType = 'pc'; // Default
        if (skuId.includes('nx')) {
            platformType = 'switch';
        } else if (skuId.includes('ps4') || skuId.includes('orbis')) {
            platformType = 'ps4';
        } else if (skuId.includes('xboxone') || skuId.includes('durango')) {
            platformType = 'xboxone';
        } else if (skuId.includes('wiiu')) {
            platformType = 'wiiu';
        }

        const serverTime = new Date().toISOString();
        const expiration = new Date(Date.now() + 3600 * 1000).toISOString(); // Expires in 1 hour

        return res.send({
            platformType: platformType,
            ticket: ticket,
            twoFactorAuthenticationTicket: null,
            profileId: userProfile.profileId,
            userId: userProfile.userId, // Assuming userId is stored in Account model
            nameOnPlatform: userProfile.name || userProfile.nickname,
            environment: "Prod", // Static for now
            expiration: expiration,
            spaceId: "cd052712-ba1d-453a-89b9-08778888d380", // Static from example
            clientIp: clientIp,
            clientIpCountry: "US", // Static for now, requires IP lookup for dynamic
            serverTime: serverTime,
            sessionId: userProfile.profileId, // Keeping profileId as sessionId as per current implementation
            sessionKey: "KJNTFMD24XOPTmpgGU3MXPuhAx3IMYSYG4YgyhPJ8rVkQDHzK1MmiOtHKrQiyL/HCOsJNCfX63oRAsyGe9CDiQ==", // Placeholder
            rememberMeTicket: null
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
