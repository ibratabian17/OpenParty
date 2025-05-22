/**
 * Song Service
 * Provides business logic for song-related operations, interacting with SongRepository.
 */
const SongRepository = require('../repositories/SongRepository');

class SongService {
    constructor() {
        this.songRepository = SongRepository;
    }

    /**
     * Get a song by its mapName.
     * @param {string} mapName - The mapName of the song.
     * @returns {Song|undefined} The Song instance or undefined if not found.
     */
    getSongByMapName(mapName) {
        return this.songRepository.findByMapName(mapName);
    }

    /**
     * Get all songs.
     * @returns {Object<string, Song>} An object containing all Song instances, keyed by mapName.
     */
    getAllSongs() {
        return this.songRepository.getAllSongs();
    }

    /**
     * Get all song mapNames.
     * @returns {string[]} An array of all song mapNames.
     */
    getAllMapNames() {
        return this.songRepository.getAllMapNames();
    }

    /**
     * Filter songs based on a provided function.
     * @param {Function} filterFunction - A function that takes a Song instance and returns true if it should be included.
     * @returns {Song[]} An array of filtered Song instances.
     */
    filterSongs(filterFunction) {
        return Object.values(this.songRepository.getAllSongs()).filter(filterFunction).sort((a, b) => {
            const titleA = (a.title + a.mapName).toLowerCase();
            const titleB = (b.title + b.mapName).toLowerCase();
            return titleA.localeCompare(titleB);
        });
    }

    /**
     * Sorts a list of mapNames by title, prioritizing those containing a specific word.
     * @param {string[]} mapNames - An array of song mapNames.
     * @param {string} word - The word to prioritize in titles.
     * @returns {string[]} A sorted array of mapNames.
     */
    sortByTitle(mapNames, word) {
        const songs = this.songRepository.getAllSongs();
        const x = [];
        const doesntContainWord = [];

        for (const mapName of mapNames) {
            const song = songs[mapName];
            if (song && song.title) {
                const titleIndex = song.title.toLowerCase().indexOf(word);
                if (titleIndex === -1) {
                    doesntContainWord.push(mapName);
                } else {
                    x.push([mapName, titleIndex]);
                }
            } else {
                doesntContainWord.push(mapName); // Handle cases where song or title might be missing
            }
        }

        doesntContainWord.sort();
        x.sort((a, b) => a[1] - b[1]); // Sort by titleIndex

        const toReturn = x.map(item => item[0]);
        return toReturn.concat(doesntContainWord);
    }

    /**
     * Filter songs by search query.
     * @param {string[]} mapNames - An array of song mapNames to filter.
     * @param {string} search - The search query.
     * @returns {string[]} An array of filtered song mapNames.
     */
    filterSongsBySearch(mapNames, search) {
        const songs = this.songRepository.getAllSongs();
        const filteredMapNames = mapNames.filter(mapName => {
            const song = songs[mapName];
            if (!song) return false;
            const lowerSearch = search.toLowerCase();
            return (
                (song.title && song.title.toLowerCase().includes(lowerSearch)) ||
                (song.artist && song.artist.toLowerCase().includes(lowerSearch)) ||
                (song.mapName && song.mapName.toLowerCase().includes(lowerSearch)) ||
                (song.originalJDVersion && String(song.originalJDVersion) === lowerSearch) || // Convert to string for comparison
                (song.tags && song.tags.includes(search)) // Tags might be exact match
            );
        });
        return this.sortByTitle(filteredMapNames, search.toLowerCase());
    }

    /**
     * Filter songs by first letter of their title.
     * @param {string[]} mapNames - An array of song mapNames to filter.
     * @param {string} filter - The first letter(s) to filter by.
     * @returns {string[]} An array of filtered song mapNames.
     */
    filterSongsByFirstLetter(mapNames, filter) {
        const songs = this.songRepository.getAllSongs();
        const regex = new RegExp(`^[${filter}].*`, 'i'); // Case-insensitive
        return mapNames.filter(mapName => {
            const song = songs[mapName];
            return song && song.title && regex.test(song.title);
        }).sort((a, b) => {
            const titleA = songs[a].title.toLowerCase();
            const titleB = songs[b].title.toLowerCase();
            return titleA.localeCompare(titleB);
        });
    }

    /**
     * Filter songs by Just Dance version.
     * @param {string[]} mapNames - An array of song mapNames to filter.
     * @param {number} version - The JD version.
     * @returns {string[]} An array of filtered song mapNames.
     */
    filterSongsByJDVersion(mapNames, version) {
        const songs = this.songRepository.getAllSongs();
        return mapNames.filter(mapName => {
            const song = songs[mapName];
            return song && song.originalJDVersion === version;
        }).sort((a, b) => {
            const titleA = songs[a].title.toLowerCase();
            const titleB = songs[b].title.toLowerCase();
            return titleA.localeCompare(titleB);
        });
    }

    /**
     * Filter songs by tags.
     * @param {string[]} mapNames - An array of song mapNames to filter.
     * @param {string} tag - The tag to filter by.
     * @returns {string[]} An array of filtered song mapNames.
     */
    filterSongsByTags(mapNames, tag) {
        const songs = this.songRepository.getAllSongs();
        return mapNames.filter(mapName => {
            const song = songs[mapName];
            return song && song.tags && song.tags.includes(tag);
        }).sort((a, b) => {
            const titleA = songs[a].title.toLowerCase();
            const titleB = songs[b].title.toLowerCase();
            return titleA.localeCompare(titleB);
        });
    }
}

module.exports = new SongService(); // Export a singleton instance
