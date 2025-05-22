/**
 * Carousel Service
 * Provides business logic for carousel generation and related operations.
 * It acts as an orchestrator for SongService and MostPlayedService.
 */
const { generateCarousel, generateSweatCarousel, generateCoopCarousel, updateMostPlayed } = require('../carousel/carousel');

class CarouselService {
    /**
     * Generate a carousel based on search criteria and type.
     * @param {string} search - The search string or tag.
     * @param {string} type - The type of carousel (e.g., "partyMap", "sweatMap").
     * @returns {Object} The generated carousel object.
     */
    generateCarousel(search, type) {
        return generateCarousel(search, type);
    }

    /**
     * Generate a cooperative carousel.
     * @param {string} search - The search string or tag.
     * @returns {Object} The generated cooperative carousel object.
     */
    generateCoopCarousel(search) {
        return generateCoopCarousel(search);
    }

    /**
     * Generate a sweat carousel.
     * @param {string} search - The search string or tag.
     * @returns {Object} The generated sweat carousel object.
     */
    generateSweatCarousel(search) {
        return generateSweatCarousel(search);
    }

    /**
     * Update the most played count for a given map.
     * @param {string} mapName - The name of the map played.
     */
    updateMostPlayed(mapName) {
        updateMostPlayed(mapName);
    }
}

module.exports = new CarouselService(); // Export a singleton instance
