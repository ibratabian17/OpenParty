/**
 * MostPlayed Model
 * Represents the most played songs data, structured by week.
 */
class MostPlayed {
    /**
     * Create a MostPlayed instance.
     * @param {Object} data - The raw data from mostplayed.json.
     */
    constructor(data = {}) {
        this.data = data; // Stores the entire mostPlayed object { weekNumber: { mapName: count } }
    }

    /**
     * Increment the play count for a specific map in a given week.
     * If the week or map does not exist, it will be initialized.
     * @param {number} weekNumber - The week number.
     * @param {string} mapName - The name of the map.
     */
    incrementPlayCount(weekNumber, mapName) {
        if (!this.data[weekNumber]) {
            this.data[weekNumber] = {};
        }
        this.data[weekNumber][mapName] = (this.data[weekNumber][mapName] || 0) + 1;
    }

    /**
     * Get the play count for a specific map in a given week.
     * @param {number} weekNumber - The week number.
     * @param {string} mapName - The name of the map.
     * @returns {number} The play count, or 0 if not found.
     */
    getPlayCount(weekNumber, mapName) {
        return (this.data[weekNumber] && this.data[weekNumber][mapName]) || 0;
    }

    /**
     * Get all most played songs for a given week, sorted by play count.
     * @param {number} weekNumber - The week number.
     * @returns {Array<Array<string, number>>} An array of [mapName, count] pairs, sorted descending by count.
     */
    getSongsForWeek(weekNumber) {
        if (!this.data[weekNumber]) {
            return [];
        }
        return Object.entries(this.data[weekNumber])
            .sort((a, b) => b[1] - a[1]);
    }

    /**
     * Convert the MostPlayed instance to a plain JavaScript object.
     * @returns {Object} A plain object representation of the most played data.
     */
    toJSON() {
        return this.data;
    }
}

module.exports = MostPlayed;
