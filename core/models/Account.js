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
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    /**
     * Update account properties
     * @param {Object} data Data to update
     * @returns {Account} Updated account instance
     */
    update(data) {
        Object.assign(this, data);
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
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Account; 