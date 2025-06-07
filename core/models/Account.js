/**
 * Account model representing a user account
 */
class Account {
    /**
     * Create a new Account instance
     * @param {Object} data Initial account data
     */
    constructor(data = {}) {
        this.profileId = data.profileId || null;
        this.userId = data.userId || null;
        this.username = data.username || null;
        this.nickname = data.nickname || null;
        this.name = data.name || null;
        this.email = data.email || null;
        this.password = data.password || null;
        this.ticket = data.ticket || null;
        this.avatar = data.avatar || null;
        this.country = data.country || null;
        this.platformId = data.platformId || null;
        this.alias = data.alias || null;
        this.aliasGender = data.aliasGender || null;
        this.jdPoints = data.jdPoints || 0;
        this.portraitBorder = data.portraitBorder || null;
        this.rank = data.rank || 0;
        this.scores = data.scores || {}; // Map of mapName to score data
        this.favorites = data.favorites || {}; // User's favorite maps
        this.songsPlayed = data.songsPlayed || []; // Array of map names
        this.progression = data.progression || {};
        this.history = data.history || {}; // Example: {"MapName": playCount}

        // New fields from extended JSON structures (assuming these were added from previous step)
        this.skin = data.skin || null;
        this.diamondPoints = data.diamondPoints || 0;
        this.unlockedAvatars = data.unlockedAvatars || [];
        this.unlockedSkins = data.unlockedSkins || [];
        this.unlockedAliases = data.unlockedAliases || [];
        this.unlockedPortraitBorders = data.unlockedPortraitBorders || [];
        this.wdfRank = data.wdfRank || 0;
        this.stars = data.stars || 0;
        this.unlocks = data.unlocks || 0;
        this.populations = data.populations || [];
        this.inProgressAliases = data.inProgressAliases || [];
        this.language = data.language || null;
        this.firstPartyEnv = data.firstPartyEnv || null;
        this.syncVersions = data.syncVersions || {};
        this.otherPids = data.otherPids || [];
        this.stats = data.stats || {};
        this.mapHistory = data.mapHistory || { classic: [], kids: [] };

        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * Update account properties
     * @param {Object} data Data to update
     * @returns {Account} Updated account instance
     */
    update(data) {
        // Helper: Check if a value is a plain object
        const _isObject = (item) => {
            return item && typeof item === 'object' && !Array.isArray(item);
        };

        // Helper: Deeply merge source object's properties into target object
        const _deepMergeObjects = (target, source) => {
            const output = { ...target };
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    const sourceVal = source[key];
                    const targetVal = output[key];
                    if (_isObject(sourceVal)) {
                        if (_isObject(targetVal)) {
                            output[key] = _deepMergeObjects(targetVal, sourceVal);
                        } else {
                            // If target's property is not an object, or doesn't exist,
                            // clone the source object property.
                            output[key] = _deepMergeObjects({}, sourceVal);
                        }
                    } else {
                        // For non-object properties (primitives, arrays), source overwrites target.
                        // Specific array merging is handled in the main update loop.
                        output[key] = sourceVal;
                    }
                }
            }
            return output;
        };

        const simpleOverwriteKeys = [
            'profileId', 'userId', 'username', 'nickname', 'name', 'email', 'password', 'ticket',
            'avatar', 'country', 'platformId', 'alias', 'aliasGender', 'jdPoints',
            'portraitBorder', 'rank', 'skin', 'diamondPoints', 'wdfRank', 'stars',
            'unlocks', 'language', 'firstPartyEnv'
        ];

        const deepMergeObjectKeys = [
            'scores', 'progression', 'history', 'favorites', 'stats', 'syncVersions'
        ];

        const unionArrayKeys = [ // Arrays of unique primitive values
            'unlockedAvatars', 'unlockedSkins', 'unlockedAliases', 'unlockedPortraitBorders', 'otherPids', 'songsPlayed'
        ];

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const incomingValue = data[key];

                if (simpleOverwriteKeys.includes(key)) {
                    this[key] = incomingValue;
                } else if (deepMergeObjectKeys.includes(key)) {
                    if (_isObject(incomingValue)) {
                        this[key] = _deepMergeObjects(this[key] || {}, incomingValue);
                    } else { // If incoming data for a deep-merge key is not an object, overwrite.
                        this[key] = incomingValue;
                    }
                } else if (unionArrayKeys.includes(key)) {
                    if (Array.isArray(incomingValue)) {
                        this[key] = [...new Set([...(this[key] || []), ...incomingValue])];
                    } else { // If incoming data for a union-array key is not an array, overwrite.
                        this[key] = incomingValue;
                    }
                } else if (key === 'populations') {
                    if (Array.isArray(incomingValue)) {
                        const existingItems = this.populations || [];
                        const mergedItems = [...existingItems];
                        incomingValue.forEach(newItem => {
                            const index = mergedItems.findIndex(ep => ep.subject === newItem.subject && ep.spaceId === newItem.spaceId);
                            if (index !== -1) mergedItems[index] = _deepMergeObjects(mergedItems[index], newItem);
                            else mergedItems.push(newItem);
                        });
                        this.populations = mergedItems;
                    } else this.populations = incomingValue;
                } else if (key === 'inProgressAliases') {
                    if (Array.isArray(incomingValue)) {
                        const existingItems = this.inProgressAliases || [];
                        const mergedItems = [...existingItems];
                        incomingValue.forEach(newItem => {
                            const index = mergedItems.findIndex(ea => ea.id === newItem.id);
                            if (index !== -1) mergedItems[index] = _deepMergeObjects(mergedItems[index], newItem);
                            else mergedItems.push(newItem);
                        });
                        this.inProgressAliases = mergedItems;
                    } else this.inProgressAliases = incomingValue;
                } else if (key === 'mapHistory') {
                    if (_isObject(incomingValue)) {
                        const currentMapHistory = this.mapHistory || { classic: [], kids: [] };
                        this.mapHistory = {
                            classic: [...new Set([...(currentMapHistory.classic || []), ...(incomingValue.classic || [])])],
                            kids: [...new Set([...(currentMapHistory.kids || []), ...(incomingValue.kids || [])])]
                        };
                    } else this.mapHistory = incomingValue;
                } else if (this.hasOwnProperty(key)) {
                    // Default for other existing properties not specially handled: overwrite
                    this[key] = incomingValue;
                }
            }
        }
        this.updatedAt = new Date().toISOString();
        return this;
    }

    /**
     * Add or update a score for a specific map
     * @param {string} mapName The map name 
     * @param {Object} scoreData Score data to save
     */
    updateScore(mapName, scoreData) {
        if (!this.scores) {
            this.scores = {};
        }
        
        this.scores[mapName] = {
            ...this.scores[mapName],
            ...scoreData,
            updatedAt: new Date().toISOString()
        };
        
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Add a map to favorites
     * @param {string} mapName The map name to favorite
     */
    addFavorite(mapName) {
        if (!this.favorites) {
            this.favorites = {};
        }
        
        this.favorites[mapName] = {
            addedAt: new Date().toISOString()
        };
        
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Remove a map from favorites
     * @param {string} mapName The map name to remove from favorites
     */
    removeFavorite(mapName) {
        if (this.favorites && this.favorites[mapName]) {
            delete this.favorites[mapName];
            this.updatedAt = new Date().toISOString();
        }
    }

    /**
     * Convert to plain object for storage
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            profileId: this.profileId,
            userId: this.userId,
            username: this.username,
            nickname: this.nickname,
            name: this.name,
            email: this.email,
            password: this.password,
            ticket: this.ticket,
            avatar: this.avatar,
            country: this.country,
            platformId: this.platformId,
            alias: this.alias,
            aliasGender: this.aliasGender,
            jdPoints: this.jdPoints,
            portraitBorder: this.portraitBorder,
            rank: this.rank,
            scores: this.scores,
            favorites: this.favorites,
            songsPlayed: this.songsPlayed,
            progression: this.progression,
            history: this.history,
            // New fields
            skin: this.skin,
            diamondPoints: this.diamondPoints,
            unlockedAvatars: this.unlockedAvatars,
            unlockedSkins: this.unlockedSkins,
            unlockedAliases: this.unlockedAliases,
            unlockedPortraitBorders: this.unlockedPortraitBorders,
            wdfRank: this.wdfRank,
            stars: this.stars,
            unlocks: this.unlocks,
            populations: this.populations,
            inProgressAliases: this.inProgressAliases,
            language: this.language,
            firstPartyEnv: this.firstPartyEnv,
            syncVersions: this.syncVersions,
            otherPids: this.otherPids,
            stats: this.stats,
            mapHistory: this.mapHistory,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Convert to plain object for public API responses, excluding sensitive data.
     * @returns {Object} Sanitized plain object representation
     */
    toPublicJSON() {
        const publicData = {
            profileId: this.profileId,
            userId: this.userId,
            username: this.username,
            nickname: this.nickname,
            name: this.name,
            avatar: this.avatar,
            country: this.country,
            platformId: this.platformId,
            alias: this.alias,
            aliasGender: this.aliasGender,
            jdPoints: this.jdPoints,
            portraitBorder: this.portraitBorder,
            rank: this.rank,
            scores: this.scores,
            favorites: this.favorites,
            songsPlayed: this.songsPlayed,
            progression: this.progression,
            history: this.history,
            // New fields
            skin: this.skin,
            diamondPoints: this.diamondPoints,
            unlockedAvatars: this.unlockedAvatars,
            unlockedSkins: this.unlockedSkins,
            unlockedAliases: this.unlockedAliases,
            unlockedPortraitBorders: this.unlockedPortraitBorders,
            wdfRank: this.wdfRank,
            stars: this.stars,
            unlocks: this.unlocks,
            populations: this.populations,
            inProgressAliases: this.inProgressAliases,
            language: this.language,
            firstPartyEnv: this.firstPartyEnv,
            syncVersions: this.syncVersions,
            otherPids: this.otherPids,
            stats: this.stats,
            mapHistory: this.mapHistory,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
        // Explicitly remove sensitive fields if they were somehow added
        delete publicData.email;
        delete publicData.password;
        delete publicData.ticket;
        return publicData;
    }
}

module.exports = Account;
