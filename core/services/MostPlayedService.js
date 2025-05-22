/**
 * MostPlayed Service
 * Provides business logic for most played song operations, interacting with MostPlayedRepository.
 */
const MostPlayedRepository = require('../repositories/MostPlayedRepository');
const Logger = require('../utils/logger');

class MostPlayedService {
    constructor() {
        this.mostPlayedRepository = MostPlayedRepository;
        this.logger = new Logger('MostPlayedService');
    }

    /**
     * Get the current week number.
     * @returns {number} The current week number.
     * @private
     */
    getWeekNumber() {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), 0, 1);
        const daysSinceStartOfWeek = Math.floor((now - startOfWeek) / (24 * 60 * 60 * 1000));
        return Math.ceil((daysSinceStartOfWeek + 1) / 7);
    }

    /**
     * Update the play count for a map.
     * @param {string} mapName - The name of the map.
     */
    async updateMostPlayed(mapName) {
        const currentWeek = this.getWeekNumber();
        const mostPlayedInstance = await this.mostPlayedRepository.getMostPlayed();
        mostPlayedInstance.incrementPlayCount(currentWeek, mapName);
        await this.mostPlayedRepository.save(mostPlayedInstance);
    }

    /**
     * Get globally most played songs for the current week.
     * @returns {Promise<string[]>} A promise that resolves to an array of mapNames, sorted by play count (descending).
     */
    async getGlobalPlayedSong() {
        try {
            const currentWeek = this.getWeekNumber();
            const mostPlayedInstance = await this.mostPlayedRepository.getMostPlayed();
            return mostPlayedInstance.getSongsForWeek(currentWeek)
                .map(item => item[0]);
        } catch (err) {
            this.logger.error('Error getting global played songs:', err.message);
            return [];
        }
    }
}

module.exports = new MostPlayedService(); // Export a singleton instance
