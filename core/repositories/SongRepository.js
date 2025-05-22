/**
 * Song Repository
 * Handles loading and providing access to song data.
 */
const path = require('path');
const { loadJsonFile } = require('../helper'); // Assuming helper has loadJsonFile
const Song = require('../models/Song');
const Logger = require('../utils/logger');

class SongRepository {
    constructor() {
        this.songs = {};
        this.logger = new Logger('SongRepository');
        this.loadSongs();
    }

    /**
     * Load all songs from the songdbs.json file.
     * @private
     */
    loadSongs() {
        this.logger.info('Loading songs from songdbs.json...');
        const songdbData = loadJsonFile('Platforms/openparty-all/songdbs.json', '../database/Platforms/openparty-all/songdbs.json');
        
        for (const mapName in songdbData) {
            if (songdbData.hasOwnProperty(mapName)) {
                this.songs[mapName] = new Song(songdbData[mapName]);
            }
        }
        this.logger.info(`Loaded ${Object.keys(this.songs).length} songs.`);
    }

    /**
     * Get a song by its mapName.
     * @param {string} mapName - The mapName of the song.
     * @returns {Song|undefined} The Song instance or undefined if not found.
     */
    findByMapName(mapName) {
        return this.songs[mapName];
    }

    /**
     * Get all songs.
     * @returns {Object<string, Song>} An object containing all Song instances, keyed by mapName.
     */
    getAllSongs() {
        return this.songs;
    }

    /**
     * Get all song mapNames.
     * @returns {string[]} An array of all song mapNames.
     */
    getAllMapNames() {
        return Object.keys(this.songs);
    }
}

module.exports = new SongRepository(); // Export a singleton instance
