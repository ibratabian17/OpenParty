const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { getSavefilePath } = require('../helper');
const Logger = require('../utils/logger');

const DB_PATH = path.join(getSavefilePath(), 'openparty.db');

class DatabaseManager {
    constructor() {
        this.logger = new Logger('DatabaseManager');
        if (DatabaseManager._instance) {
            this.logger.info('Returning existing instance.');
            return DatabaseManager._instance;
        }
        this._db = null;
        DatabaseManager._instance = this;
        this.logger.info('New instance created.');
    }

    static getInstance() {
        if (!DatabaseManager._instance) {
            DatabaseManager._instance = new DatabaseManager();
        }
        return DatabaseManager._instance;
    }

    initialize() {
        if (this._db) {
            this.logger.info('Database already initialized (this._db is set).');
            return Promise.resolve(this._db);
        }

        this.logger.info('Starting database initialization...');
        return new Promise((resolve, reject) => {
            this._db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    this.logger.error('Error connecting to database:', err.message);
                    this._db = null;
                    reject(err);
                } else {
                    this.logger.info('Connected to the SQLite database. this._db is now set.');
                    this._db.serialize(() => {
                        // Create most_played table
                        this._db.run(`CREATE TABLE IF NOT EXISTS most_played (
                            mapName TEXT PRIMARY KEY,
                            playCount INTEGER DEFAULT 0
                        )`, (err) => {
                            if (err) {
                                this.logger.error('Error creating most_played table:', err.message);
                                return reject(err);
                            }
                        });

                        // Create leaderboard table
                        this._db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            mapName TEXT NOT NULL,
                            profileId TEXT NOT NULL,
                            username TEXT NOT NULL,
                            score INTEGER NOT NULL,
                            timestamp TEXT NOT NULL,
                            UNIQUE(mapName, profileId)
                        )`, (err) => {
                            if (err) {
                                this.logger.error('Error creating leaderboard table:', err.message);
                                return reject(err);
                            }
                        });

                        // Create dotw (Dance of the Week) table
                        this._db.run(`CREATE TABLE IF NOT EXISTS dotw (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            mapName TEXT NOT NULL,
                            profileId TEXT NOT NULL,
                            username TEXT NOT NULL,
                            score INTEGER NOT NULL,
                            timestamp TEXT NOT NULL,
                            weekNumber INTEGER NOT NULL,
                            gameVersion TEXT,
                            rank INTEGER,
                            name TEXT,
                            avatar TEXT,
                            country TEXT,
                            platformId TEXT,
                            alias TEXT,
                            aliasGender INTEGER,
                            jdPoints INTEGER,
                            portraitBorder TEXT,
                            UNIQUE(mapName, profileId, weekNumber)
                        )`, (err) => {
                            if (err) {
                                this.logger.error('Error creating dotw table:', err.message);
                                return reject(err);
                            }
                        });

                        // Create user_profiles table
                        this._db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
                            profileId TEXT PRIMARY KEY,
                            userId TEXT, -- Already present
                            username TEXT,
                            nickname TEXT,
                            name TEXT,
                            email TEXT,
                            password TEXT, -- Consider hashing if storing sensitive passwords
                            ticket TEXT,
                            alias TEXT,
                            aliasGender INTEGER,
                            avatar TEXT,
                            country TEXT,
                            platformId TEXT,
                            jdPoints INTEGER,
                            portraitBorder TEXT,
                            rank INTEGER,
                            scores TEXT, -- JSON stored as TEXT
                            favorites TEXT, -- JSON stored as TEXT
                            songsPlayed TEXT, -- JSON array stored as TEXT
                            progression TEXT, -- JSON stored as TEXT
                            history TEXT, -- JSON stored as TEXT
                            skin TEXT,
                            diamondPoints INTEGER,
                            unlockedAvatars TEXT, -- JSON array stored as TEXT
                            unlockedSkins TEXT, -- JSON array stored as TEXT
                            unlockedAliases TEXT, -- JSON array stored as TEXT
                            unlockedPortraitBorders TEXT, -- JSON array stored as TEXT
                            wdfRank INTEGER,
                            stars INTEGER,
                            unlocks INTEGER,
                            populations TEXT, -- JSON array stored as TEXT
                            inProgressAliases TEXT, -- JSON array stored as TEXT
                            language TEXT,
                            firstPartyEnv TEXT,
                            syncVersions TEXT, -- JSON stored as TEXT
                            otherPids TEXT, -- JSON array stored as TEXT
                            stats TEXT, -- JSON stored as TEXT
                            mapHistory TEXT, -- JSON stored as TEXT
                            createdAt TEXT,
                            updatedAt TEXT
                        )`, (err) => {
                            if (err) {
                                this.logger.error('Error creating user_profiles table:', err.message);
                                reject(err);
                            } else {
                                this.logger.info('All tables created. Resolving initialize promise.');
                                resolve(this._db);
                            }
                        });
                    });
                }
            });
        });
    }

    getDb() {
        this.logger.info(`getDb() called. this._db is: ${this._db ? 'set' : 'null'}`);
        if (!this._db) {
            throw new Error('DatabaseManager: Database not initialized. Call initialize() first.');
        }
        return this._db;
    }
}

module.exports = DatabaseManager;
