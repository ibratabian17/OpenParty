/**
 * Song Model
 * Represents a single song entry in the song database.
 */
class Song {
    /**
     * Create a Song instance.
     * @param {Object} data - The raw song data from songdbs.json.
     */
    constructor(data) {
        this.mapName = data.mapName;
        this.title = data.title;
        this.artist = data.artist;
        this.originalJDVersion = data.originalJDVersion;
        this.tags = data.tags || [];
        // Add other properties as needed from the songdb structure
        this.data = data; // Store original data for flexibility
    }

    /**
     * Convert the Song instance to a plain JavaScript object.
     * @returns {Object} A plain object representation of the song.
     */
    toJSON() {
        return {
            mapName: this.mapName,
            title: this.title,
            artist: this.artist,
            originalJDVersion: this.originalJDVersion,
            tags: this.tags,
            ...this.data // Include all original data
        };
    }
}

module.exports = Song;
