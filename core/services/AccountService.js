/**
 * Service for handling account-related business logic
 */
const Account = require('../models/Account');
const AccountRepository = require('../repositories/AccountRepository');
const Logger = require('../utils/logger');

class AccountService {
    constructor() {
        this.logger = new Logger('AccountService');
    }

    /**
     * Get user data by profile ID
     * @param {string} profileId The profile ID
     * @returns {Promise<Account|null>} The account or null if not found
     */
    async getUserData(profileId) {
        this.logger.info(`Getting user data for ${profileId}`);
        return AccountRepository.findById(profileId);
    }

    /**
     * Find user by ticket
     * @param {string} ticket The ticket to search for
     * @returns {Promise<string|null>} Profile ID if found, null otherwise
     */
    async findUserFromTicket(ticket) {
        this.logger.info(`Finding user from ticket`);
        const account = await AccountRepository.findByTicket(ticket);
        return account ? account.profileId : null;
    }

    /**
     * Find user by nickname
     * @param {string} nickname The nickname to search for
     * @returns {Promise<Account|null>} The account or null if not found
     */
    async findUserFromNickname(nickname) {
        this.logger.info(`Finding user with nickname ${nickname}`);
        return AccountRepository.findByNickname(nickname);
    }

    /**
     * Add a new user ID mapping
     * @param {string} profileId The profile ID
     * @param {string} userId The user ID to map
     * @returns {Promise<Account>} The updated account
     */
    async addUserId(profileId, userId) {
        this.logger.info(`Adding user ID ${userId} for profile ${profileId}`);
        let account = await AccountRepository.findById(profileId);
        
        if (!account) {
            account = new Account({ profileId });
        }
        
        account.update({ userId });
        return AccountRepository.save(account);
    }

    /**
     * Update the user's ticket
     * @param {string} profileId The profile ID
     * @param {string} ticket The new ticket value
     * @returns {Promise<Account>} The updated account
     */
    async updateUserTicket(profileId, ticket) {
        this.logger.info(`Updating ticket for profile ${profileId}`);
        let account = await AccountRepository.findById(profileId);
        
        if (!account) {
            account = new Account({ profileId });
        }
        
        account.update({ ticket });
        return AccountRepository.save(account);
    }

    /**
     * Update user information
     * @param {string} profileId The profile ID
     * @param {Object} userData The user data to update
     * @returns {Promise<Account>} The updated account
     */
    async updateUser(profileId, userData) {
        this.logger.info(`Updating user ${profileId}`);
        let account = await AccountRepository.findById(profileId);
        
        if (!account) {
            account = new Account({ 
                profileId,
                ...userData
            });
            this.logger.info(`Created new user ${profileId}`);
        } else {
            account.update(userData);
            this.logger.info(`Updated existing user ${profileId}`);
        }
        
        return AccountRepository.save(account);
    }

    /**
     * Update user score for a map
     * @param {string} profileId The profile ID
     * @param {string} mapName The map name
     * @param {Object} scoreData The score data
     * @returns {Promise<Account>} The updated account
     */
    async updateUserScore(profileId, mapName, scoreData) {
        this.logger.info(`Updating score for ${profileId} on ${mapName}`);
        const account = await AccountRepository.findById(profileId);
        
        if (!account) {
            this.logger.info(`User ${profileId} not found, cannot update score`);
            return null;
        }
        
        account.updateScore(mapName, scoreData);
        return AccountRepository.save(account);
    }

    /**
     * Add map to user favorites
     * @param {string} profileId The profile ID
     * @param {string} mapName The map name
     * @returns {Promise<Account>} The updated account
     */
    async addMapToFavorites(profileId, mapName) {
        this.logger.info(`Adding ${mapName} to favorites for ${profileId}`);
        const account = await AccountRepository.findById(profileId);
        
        if (!account) {
            this.logger.info(`User ${profileId} not found, cannot add favorite`);
            return null;
        }
        
        account.addFavorite(mapName);
        return AccountRepository.save(account);
    }

    /**
     * Remove map from user favorites
     * @param {string} profileId The profile ID
     * @param {string} mapName The map name
     * @returns {Promise<Account>} The updated account
     */
    async removeMapFromFavorites(profileId, mapName) {
        this.logger.info(`Removing ${mapName} from favorites for ${profileId}`);
        const account = await AccountRepository.findById(profileId);
        
        if (!account) {
            this.logger.info(`User ${profileId} not found, cannot remove favorite`);
            return null;
        }
        
        account.removeFavorite(mapName);
        return AccountRepository.save(account);
    }

    /**
     * Get all accounts
     * @returns {Promise<Object>} Map of profileId to Account instances
     */
    async getAllAccounts() {
        return AccountRepository.loadAll();
    }
}

module.exports = new AccountService(); // Export a singleton instance
