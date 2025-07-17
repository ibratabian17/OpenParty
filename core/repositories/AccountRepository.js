/**
 * AccountRepository handles data persistence for Account models
 */
const { getDb } = require('../database/sqlite');
const Account = require('../models/Account');
const Logger = require('../utils/logger');

class AccountRepository {
    /**
     * Create a new AccountRepository instance
     */
    constructor() {
        // No need for file paths or secret key with SQLite
        this.logger = new Logger('AccountRepository');
    }

    /**
     * Load all accounts from storage
     * @returns {Promise<Object>} Promise resolving to a Map of profileId to Account instances
     */
    async loadAll() {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM user_profiles', [], (err, rows) => {
                if (err) {
                    this.logger.error('Error loading accounts from DB:', err.message);
                    reject(err);
                } else {
                    const accounts = {};
                    rows.forEach(row => {
                        try {
                            const accountData = {
                                // Existing fields
                                profileId: row.profileId,
                                userId: row.userId,
                                username: row.username,
                                nickname: row.nickname,
                                name: row.name,
                                email: row.email,
                                password: row.password, // Should be handled securely if stored
                                alias: row.alias,
                                aliasGender: row.aliasGender,
                                avatar: row.avatar,
                                country: row.country,
                                platformId: row.platformId,
                                jdPoints: row.jdPoints,
                                portraitBorder: row.portraitBorder,
                                rank: row.rank,
                                scores: row.scores ? JSON.parse(row.scores) : {},
                                songsPlayed: row.songsPlayed ? JSON.parse(row.songsPlayed) : [],
                                favorites: row.favorites ? JSON.parse(row.favorites) : {},
                                progression: row.progression ? JSON.parse(row.progression) : {},
                                history: row.history ? JSON.parse(row.history) : {},
                                createdAt: row.createdAt,
                                updatedAt: row.updatedAt,
                                // New fields
                                skin: row.skin,
                                diamondPoints: row.diamondPoints,
                                unlockedAvatars: row.unlockedAvatars ? JSON.parse(row.unlockedAvatars) : [],
                                unlockedSkins: row.unlockedSkins ? JSON.parse(row.unlockedSkins) : [],
                                unlockedAliases: row.unlockedAliases ? JSON.parse(row.unlockedAliases) : [],
                                unlockedPortraitBorders: row.unlockedPortraitBorders ? JSON.parse(row.unlockedPortraitBorders) : [],
                                wdfRank: row.wdfRank,
                                stars: row.stars,
                                unlocks: row.unlocks,
                                populations: row.populations ? JSON.parse(row.populations) : [],
                                inProgressAliases: row.inProgressAliases ? JSON.parse(row.inProgressAliases) : [],
                                language: row.language,
                                firstPartyEnv: row.firstPartyEnv,
                                syncVersions: row.syncVersions ? JSON.parse(row.syncVersions) : {},
                                otherPids: row.otherPids ? JSON.parse(row.otherPids) : [],
                                stats: row.stats ? JSON.parse(row.stats) : {},
                                mapHistory: row.mapHistory ? JSON.parse(row.mapHistory) : { classic: [], kids: [] }
                            };
                            accounts[row.profileId] = new Account(accountData);
                        } catch (parseError) {
                            this.logger.error(`Error parsing JSON for profile ${row.profileId}:`, parseError.message);
                            // Skip this row or handle error as appropriate
                        }
                    });
                    this.logger.info(`Loaded ${Object.keys(accounts).length} accounts from DB.`);
                    resolve(accounts);
                }
            });
        });
    }

    /**
     * Save an account to storage (insert or update)
     * @param {Account} account The account instance to save
     * @returns {Promise<Account>} Promise resolving to the saved account
     */
    async save(account) {
        if (!account.profileId) {
            throw new Error('Cannot save account without profileId');
        }
        
        const db = getDb();
        const accountData = account.toJSON(); // Get plain object representation

        // Stringify JSON fields
        const scoresJson = JSON.stringify(accountData.scores || {});
        const songsPlayedJson = JSON.stringify(accountData.songsPlayed || []);
        const favoritesJson = JSON.stringify(accountData.favorites || []);
        const progressionJson = JSON.stringify(accountData.progression || {});
        const historyJson = JSON.stringify(accountData.history || {});
        // Stringify new JSON fields
        const unlockedAvatarsJson = JSON.stringify(accountData.unlockedAvatars || []);
        const unlockedSkinsJson = JSON.stringify(accountData.unlockedSkins || []);
        const unlockedAliasesJson = JSON.stringify(accountData.unlockedAliases || []);
        const unlockedPortraitBordersJson = JSON.stringify(accountData.unlockedPortraitBorders || []);
        const populationsJson = JSON.stringify(accountData.populations || []);
        const inProgressAliasesJson = JSON.stringify(accountData.inProgressAliases || []);
        const syncVersionsJson = JSON.stringify(accountData.syncVersions || {});
        const otherPidsJson = JSON.stringify(accountData.otherPids || []);
        const statsJson = JSON.stringify(accountData.stats || {});
        const mapHistoryJson = JSON.stringify(accountData.mapHistory || { classic: [], kids: [] });

        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO user_profiles (
                profileId, userId, username, nickname, name, email, password,
                alias, aliasGender, avatar, country, platformId, jdPoints, portraitBorder, rank,
                scores, songsPlayed, favorites, progression, history,
                skin, diamondPoints, unlockedAvatars, unlockedSkins, unlockedAliases, unlockedPortraitBorders,
                wdfRank, stars, unlocks, populations, inProgressAliases, language, firstPartyEnv,
                syncVersions, otherPids, stats, mapHistory,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                accountData.profileId,
                accountData.userId,
                accountData.username,
                accountData.nickname,
                accountData.name,
                accountData.email,
                accountData.password, // Ensure this is handled securely (e.g., hashed) if stored
                accountData.alias,
                accountData.aliasGender,
                accountData.avatar,
                accountData.country,
                accountData.platformId,
                accountData.jdPoints,
                accountData.portraitBorder,
                accountData.rank,
                scoresJson,
                songsPlayedJson,
                favoritesJson,
                progressionJson,
                historyJson,
                // New fields
                accountData.skin,
                accountData.diamondPoints,
                unlockedAvatarsJson,
                unlockedSkinsJson,
                unlockedAliasesJson,
                unlockedPortraitBordersJson,
                accountData.wdfRank,
                accountData.stars,
                accountData.unlocks,
                populationsJson,
                inProgressAliasesJson,
                accountData.language,
                accountData.firstPartyEnv,
                syncVersionsJson,
                otherPidsJson,
                statsJson,
                mapHistoryJson,
                // Timestamps
                accountData.createdAt,
                accountData.updatedAt
            ],
            (err) => {
                if (err) {
                    this.logger.error(`Error saving account ${account.profileId} to DB:`, err.message);
                    reject(err);
                } else {
                    this.logger.info(`Saved account ${account.profileId} to DB.`);
                    resolve(account);
                }
            });
        });
    }

    /**
     * Get an account by profileId
     * @param {string} profileId The profile ID
     * @returns {Promise<Account|null>} Promise resolving to the account or null if not found
     */
    async findById(profileId) {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM user_profiles WHERE profileId = ?', [profileId], (err, row) => {
                if (err) {
                    this.logger.error(`Error finding account by ID ${profileId}:`, err.message);
                    reject(err);
                } else if (row) {
                    try {
                        const accountData = {
                            // Existing fields
                            profileId: row.profileId,
                            userId: row.userId,
                            username: row.username,
                            nickname: row.nickname,
                            name: row.name,
                            email: row.email,
                            password: row.password,
                            alias: row.alias,
                            aliasGender: row.aliasGender,
                            avatar: row.avatar,
                            country: row.country,
                            platformId: row.platformId,
                            jdPoints: row.jdPoints,
                            portraitBorder: row.portraitBorder,
                            rank: row.rank,
                            scores: row.scores ? JSON.parse(row.scores) : {},
                            songsPlayed: row.songsPlayed ? JSON.parse(row.songsPlayed) : [],
                            favorites: row.favorites ? JSON.parse(row.favorites) : {},
                            progression: row.progression ? JSON.parse(row.progression) : {},
                            history: row.history ? JSON.parse(row.history) : {},
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt,
                            // New fields
                            skin: row.skin,
                            diamondPoints: row.diamondPoints,
                            unlockedAvatars: row.unlockedAvatars ? JSON.parse(row.unlockedAvatars) : [],
                            unlockedSkins: row.unlockedSkins ? JSON.parse(row.unlockedSkins) : [],
                            unlockedAliases: row.unlockedAliases ? JSON.parse(row.unlockedAliases) : [],
                            unlockedPortraitBorders: row.unlockedPortraitBorders ? JSON.parse(row.unlockedPortraitBorders) : [],
                            wdfRank: row.wdfRank,
                            stars: row.stars,
                            unlocks: row.unlocks,
                            populations: row.populations ? JSON.parse(row.populations) : [],
                            inProgressAliases: row.inProgressAliases ? JSON.parse(row.inProgressAliases) : [],
                            language: row.language,
                            firstPartyEnv: row.firstPartyEnv,
                            syncVersions: row.syncVersions ? JSON.parse(row.syncVersions) : {},
                            otherPids: row.otherPids ? JSON.parse(row.otherPids) : [],
                            stats: row.stats ? JSON.parse(row.stats) : {},
                            mapHistory: row.mapHistory ? JSON.parse(row.mapHistory) : { classic: [], kids: [] }
                        };
                        resolve(new Account(accountData));
                    } catch (parseError) {
                        this.logger.error(`Error parsing JSON for profile ${row.profileId}:`, parseError.message);
                        resolve(null); // Return null if parsing fails
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Find an account by ticket
     * @param {string} ticket The ticket to search for
     * @returns {Promise<Account|null>} Promise resolving to the account or null if not found
     */
    async findByTicket(ticket) {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM user_profiles WHERE ticket = ?', [ticket], (err, row) => {
                if (err) {
                    this.logger.error(`Error finding account by ticket ${ticket}:`, err.message);
                    reject(err);
                } else if (row) {
                    try {
                        const accountData = {
                            // Existing fields
                            profileId: row.profileId,
                            userId: row.userId,
                            username: row.username,
                            nickname: row.nickname,
                            name: row.name,
                            email: row.email,
                            password: row.password,
                            alias: row.alias,
                            aliasGender: row.aliasGender,
                            avatar: row.avatar,
                            country: row.country,
                            platformId: row.platformId,
                            jdPoints: row.jdPoints,
                            portraitBorder: row.portraitBorder,
                            rank: row.rank,
                            scores: row.scores ? JSON.parse(row.scores) : {},
                            songsPlayed: row.songsPlayed ? JSON.parse(row.songsPlayed) : [],
                            favorites: row.favorites ? JSON.parse(row.favorites) : {},
                            progression: row.progression ? JSON.parse(row.progression) : {},
                            history: row.history ? JSON.parse(row.history) : {},
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt,
                            // New fields
                            skin: row.skin,
                            diamondPoints: row.diamondPoints,
                            unlockedAvatars: row.unlockedAvatars ? JSON.parse(row.unlockedAvatars) : [],
                            unlockedSkins: row.unlockedSkins ? JSON.parse(row.unlockedSkins) : [],
                            unlockedAliases: row.unlockedAliases ? JSON.parse(row.unlockedAliases) : [],
                            unlockedPortraitBorders: row.unlockedPortraitBorders ? JSON.parse(row.unlockedPortraitBorders) : [],
                            wdfRank: row.wdfRank,
                            stars: row.stars,
                            unlocks: row.unlocks,
                            populations: row.populations ? JSON.parse(row.populations) : [],
                            inProgressAliases: row.inProgressAliases ? JSON.parse(row.inProgressAliases) : [],
                            language: row.language,
                            firstPartyEnv: row.firstPartyEnv,
                            syncVersions: row.syncVersions ? JSON.parse(row.syncVersions) : {},
                            otherPids: row.otherPids ? JSON.parse(row.otherPids) : [],
                            stats: row.stats ? JSON.parse(row.stats) : {},
                            mapHistory: row.mapHistory ? JSON.parse(row.mapHistory) : { classic: [], kids: [] }
                        };
                        resolve(new Account(accountData));
                    } catch (parseError) {
                        this.logger.error(`Error parsing JSON for profile ${row.profileId}:`, parseError.message);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Find an account by nickname
     * @param {string} nickname The nickname to search for
     * @returns {Promise<Account|null>} Promise resolving to the account or null if not found
     */
    async findByNickname(nickname) {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM user_profiles WHERE name = ?', [nickname], (err, row) => {
                if (err) {
                    this.logger.error(`Error finding account by nickname ${nickname}:`, err.message);
                    reject(err);
                } else if (row) {
                    try {
                        const accountData = {
                            // Existing fields
                            profileId: row.profileId,
                            userId: row.userId,
                            username: row.username,
                            nickname: row.nickname,
                            name: row.name,
                            email: row.email,
                            password: row.password,
                            alias: row.alias,
                            aliasGender: row.aliasGender,
                            avatar: row.avatar,
                            country: row.country,
                            platformId: row.platformId,
                            jdPoints: row.jdPoints,
                            portraitBorder: row.portraitBorder,
                            rank: row.rank,
                            scores: row.scores ? JSON.parse(row.scores) : {},
                            songsPlayed: row.songsPlayed ? JSON.parse(row.songsPlayed) : [],
                            favorites: row.favorites ? JSON.parse(row.favorites) : {},
                            progression: row.progression ? JSON.parse(row.progression) : {},
                            history: row.history ? JSON.parse(row.history) : {},
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt,
                            // New fields
                            skin: row.skin,
                            diamondPoints: row.diamondPoints,
                            unlockedAvatars: row.unlockedAvatars ? JSON.parse(row.unlockedAvatars) : [],
                            unlockedSkins: row.unlockedSkins ? JSON.parse(row.unlockedSkins) : [],
                            unlockedAliases: row.unlockedAliases ? JSON.parse(row.unlockedAliases) : [],
                            unlockedPortraitBorders: row.unlockedPortraitBorders ? JSON.parse(row.unlockedPortraitBorders) : [],
                            wdfRank: row.wdfRank,
                            stars: row.stars,
                            unlocks: row.unlocks,
                            populations: row.populations ? JSON.parse(row.populations) : [],
                            inProgressAliases: row.inProgressAliases ? JSON.parse(row.inProgressAliases) : [],
                            language: row.language,
                            firstPartyEnv: row.firstPartyEnv,
                            syncVersions: row.syncVersions ? JSON.parse(row.syncVersions) : {},
                            otherPids: row.otherPids ? JSON.parse(row.otherPids) : [],
                            stats: row.stats ? JSON.parse(row.stats) : {},
                            mapHistory: row.mapHistory ? JSON.parse(row.mapHistory) : { classic: [], kids: [] }
                        };
                        resolve(new Account(accountData));
                    } catch (parseError) {
                        this.logger.error(`Error parsing JSON for profile ${row.profileId}:`, parseError.message);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Delete an account
     * @param {string} profileId The profile ID to delete
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async delete(profileId) {
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM user_profiles WHERE profileId = ?', [profileId], (err) => {
                if (err) {
                    this.logger.error(`Error deleting account ${profileId} from DB:`, err.message);
                    reject(err);
                } else {
                    this.logger.info(`Deleted account ${profileId} from DB.`);
                    resolve(this.changes > 0); // True if a row was deleted
                }
            });
        });
    }

    /**
     * Update an account with new data
     * @param {string} profileId The profile ID
     * @param {Object} data The data to update
     * @returns {Promise<Account|null>} Promise resolving to the updated account or null if not found
     */
    async update(profileId, data) {
        const existingAccount = await this.findById(profileId);
        
        if (!existingAccount) {
            return null;
        }
        
        existingAccount.update(data);
        await this.save(existingAccount); // Use the async save method
        
        return existingAccount;
    }
}

module.exports = new AccountRepository(); // Export a singleton instance