/**
 * MostPlayed Repository
 * Handles loading and saving most played songs data.
 */
const { getDb } = require('../database/sqlite');
const MostPlayed = require('../models/MostPlayed');
const Logger = require('../utils/logger');

class MostPlayedRepository {
    constructor() {
        // No need to load data in constructor, will be fetched from DB on demand
        this.logger = new Logger('MostPlayedRepository');
    }

    /**
     * Load most played data from the SQLite database.
     * @returns {Promise<MostPlayed>} A promise that resolves to the MostPlayed instance.
     */
    async load() {
        this.logger.info('Loading most played data from DB...');
        const db = getDb();
        return new Promise((resolve, reject) => {
            db.all('SELECT mapName, playCount FROM most_played', [], (err, rows) => {
                if (err) {
                    this.logger.error(`Error reading most_played from DB: ${err.message}`);
                    reject(err);
                } else {
                    const data = {};
                    rows.forEach(row => {
                        data[row.mapName] = row.playCount;
                    });
                    this.logger.info('Most played data loaded from DB.');
                    resolve(new MostPlayed(data));
                }
            });
        });
    }

    /**
     * Save the current most played data to the SQLite database.
     * @param {MostPlayed} mostPlayedInstance - The MostPlayed instance to save.
     * @returns {Promise<void>} A promise that resolves when data is saved.
     */
    async save(mostPlayedInstance) {
        this.logger.info('Saving most played data to DB...');
        const db = getDb();
        const data = mostPlayedInstance.toJSON();
        
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION;');
                const stmt = db.prepare(`INSERT OR REPLACE INTO most_played (mapName, playCount) VALUES (?, ?)`);
                
                for (const mapName in data) {
                    stmt.run(mapName, data[mapName], (err) => {
                        if (err) {
                            this.logger.error(`Error saving ${mapName}: ${err.message}`);
                            db.run('ROLLBACK;');
                            reject(err);
                            return;
                        }
                    });
                }
                
                stmt.finalize((err) => {
                    if (err) {
                        this.logger.error('Error finalizing statement:', err.message);
                        db.run('ROLLBACK;');
                        reject(err);
                    } else {
                        db.run('COMMIT;', (commitErr) => {
                            if (commitErr) {
                                this.logger.error('Error committing transaction:', commitErr.message);
                                reject(commitErr);
                            } else {
                                this.logger.info('Most played data saved to DB.');
                                resolve();
                            }
                        });
                    }
                });
            });
        });
    }

    /**
     * Get the current MostPlayed instance from the database.
     * @returns {Promise<MostPlayed>} A promise that resolves to the MostPlayed instance.
     */
    async getMostPlayed() {
        return this.load();
    }
}

module.exports = new MostPlayedRepository(); // Export a singleton instance
