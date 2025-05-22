/**
 * Leaderboard Route Handler for OpenParty
 * Handles leaderboard-related routes
 */
const RouteHandler = require('./RouteHandler');
const { getDb } = require('../../database/sqlite');
const core = require('../../var').main;

class LeaderboardRouteHandler extends RouteHandler {
  /**
   * Create a new leaderboard route handler
   */
  constructor() {
    super('LeaderboardRouteHandler');
    
    // Bind handler methods to maintain 'this' context
    this.handleGetLeaderboard = this.handleGetLeaderboard.bind(this);
    this.handlePostScore = this.handlePostScore.bind(this);
    this.handleGetDanceOfTheWeek = this.handleGetDanceOfTheWeek.bind(this);
    this.handleLeaderboard = this.handleLeaderboard.bind(this);
    this.getWeekNumber = this.getWeekNumber.bind(this);
  }

  /**
   * Initialize the routes
   * @param {Express} app - The Express application instance
   */
  initroute(app) {
    console.log(`[ROUTE] ${this.name} initializing routes...`);
    
    // Register routes
    this.registerGet(app, '/v1/leaderboard/:mapName', this.handleGetLeaderboard);
    this.registerPost(app, '/v1/leaderboard/:mapName', this.handlePostScore);
    this.registerGet(app, '/v1/dance-of-the-week', this.handleGetDanceOfTheWeek);
    this.registerGet(app, "/leaderboard/v1/maps/:mapName/:type", this.handleLeaderboard);
    this.registerGet(app, "/leaderboard/v1/coop_points/mine", this.handleCoopPoints);
    
    console.log(`[ROUTE] ${this.name} routes initialized`);
  }

  /**
   * Handle leaderboard retrieval
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   */
  async handleGetLeaderboard(req, res) {
    const { mapName } = req.params;
    try {
      const scores = await this.getLeaderboard(mapName);
      res.json({
        mapName,
        scores: scores.sort((a, b) => b.score - a.score).slice(0, 100)
      });
    } catch (error) {
      console.error(`[LEADERBOARD] Error getting leaderboard for ${mapName}:`, error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handle score submission
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   */
  async handlePostScore(req, res) {
    const { mapName } = req.params;
    const { profileId, score, username } = req.body;
    
    if (!profileId || !score || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
      const db = getDb();
      const timestamp = new Date().toISOString();

      // Check if user already has a score for this map
      const existingScore = await new Promise((resolve, reject) => {
        db.get('SELECT score FROM leaderboard WHERE mapName = ? AND profileId = ?', [mapName, profileId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingScore) {
        // Update score if new score is higher
        if (score > existingScore.score) {
          await new Promise((resolve, reject) => {
            db.run('UPDATE leaderboard SET score = ?, username = ?, timestamp = ? WHERE mapName = ? AND profileId = ?',
              [score, username, timestamp, mapName, profileId], (err) => {
                if (err) reject(err);
                else resolve();
              });
          });
        }
      } else {
        // Add new score
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO leaderboard (mapName, profileId, username, score, timestamp) VALUES (?, ?, ?, ?, ?)',
            [mapName, profileId, username, score, timestamp], (err) => {
              if (err) reject(err);
              else resolve();
            });
        });
      }
      
      res.json({
        success: true,
        mapName,
        score
      });
    } catch (error) {
      console.error(`[LEADERBOARD] Error posting score for ${mapName}:`, error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handle dance of the week retrieval
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   */
  async handleGetDanceOfTheWeek(req, res) {
    try {
      const dotw = await this.getDanceOfTheWeek();
      res.json(dotw);
    } catch (error) {
      console.error('[LEADERBOARD] Error getting Dance of the Week:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Get leaderboard data from SQLite.
   * @param {string} mapName - The name of the map.
   * @returns {Promise<Array>} A promise that resolves to an array of leaderboard entries.
   * @private
   */
  async getLeaderboard(mapName) {
    const db = getDb();
    return new Promise((resolve, reject) => {
      db.all('SELECT profileId, username, score, timestamp FROM leaderboard WHERE mapName = ? ORDER BY score DESC LIMIT 100', [mapName], (err, rows) => {
        if (err) {
          console.error(`[LEADERBOARD] Error loading leaderboard for ${mapName} from DB: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Save leaderboard data to SQLite.
   * This method is now handled by handlePostScore for individual score updates.
   * This placeholder is kept for compatibility if other parts of the code still call it.
   * @param {Object} leaderboard - Leaderboard data to save (ignored for SQLite).
   * @private
   */
  async saveLeaderboard(leaderboard) {
    console.log('[LEADERBOARD] saveLeaderboard (legacy) called. Data is saved via handlePostScore.');
    // This method is largely deprecated with the new SQLite approach for individual score updates.
    // If a full leaderboard object is passed, it implies a bulk update or migration, which is not
    // directly supported by the current single-score update logic.
    // For now, it will just log a message.
  }

  /**
   * Get dance of the week data from SQLite.
   * @returns {Promise<Object>} A promise that resolves to the Dance of the Week data.
   * @private
   */
  async getDanceOfTheWeek() {
    const db = getDb();
    const currentWeekNumber = this.getWeekNumber();
    return new Promise((resolve, reject) => {
      db.get('SELECT mapName, weekNumber, startDate FROM dotw WHERE weekNumber = ?', [currentWeekNumber], async (err, row) => {
        if (err) {
          console.error(`[LEADERBOARD] Error loading DOTW from DB: ${err.message}`);
          reject(err);
        } else if (row) {
          resolve(row);
        } else {
          // Create default dance of the week if not found
          const defaultDotw = {
            mapName: 'Starships', // Default map
            weekNumber: currentWeekNumber,
            startDate: new Date().toISOString()
          };
          await this.saveDanceOfTheWeek(defaultDotw);
          resolve(defaultDotw);
        }
      });
    });
  }

  /**
   * Save dance of the week data to SQLite.
   * @param {Object} dotw - Dance of the week data to save.
   * @returns {Promise<void>} A promise that resolves when data is saved.
   * @private
   */
  async saveDanceOfTheWeek(dotw) {
    const db = getDb();
    return new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO dotw (mapName, weekNumber, startDate) VALUES (?, ?, ?)`,
        [dotw.mapName, dotw.weekNumber, dotw.startDate], (err) => {
          if (err) {
            console.error(`[LEADERBOARD] Error saving DOTW to DB: ${err.message}`);
            reject(err);
          } else {
            console.log('[LEADERBOARD] Dance of the Week data saved to DB.');
            resolve();
          }
        });
    });
  }

  /**
   * Get current week number
   * @returns {number} Week number
   * @private
   */
  getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(diff / oneWeek);
  }

  /**
   * Handle leaderboard requests
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   */
  async handleLeaderboard(req, res) {
    const { mapName, type } = req.params;
    const currentWeekNumber = this.getWeekNumber();

    try {
      switch (type) {
        case "dancer-of-the-week":
          await this.handleDancerOfTheWeek(req, res, mapName, currentWeekNumber);
          break;
        case "friends":
          res.send({ __class: "LeaderboardList", entries: [] });
          break;
        default:
          await this.handleRegularLeaderboard(req, res, mapName);
          break;
      }
    } catch (error) {
      console.error("[LEADERBOARD] Error:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Handle dancer of the week requests
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {string} mapName - The map name
   * @param {number} currentWeekNumber - Current week number
   * @private
   */
  async handleDancerOfTheWeek(req, res, mapName, currentWeekNumber) {
    const db = getDb();
    try {
      const dotwEntries = await new Promise((resolve, reject) => {
        db.all('SELECT profileId, score, gameVersion, rank, name, avatar, country, platformId, alias, aliasGender, jdPoints, portraitBorder FROM dotw WHERE mapName = ? AND weekNumber = ? ORDER BY score DESC LIMIT 1', [mapName, currentWeekNumber], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (dotwEntries.length === 0) {
        return res.json({
          "__class": "DancerOfTheWeek",
          "gameVersion": "jd2019", // Default if no DOTW found
        });
      }

      const highestEntry = dotwEntries[0]; // Since we limited to 1 and ordered by score DESC

      const dancerOfTheWeek = {
        "__class": "DancerOfTheWeek",
        "profileId": highestEntry.profileId,
        "score": highestEntry.score,
        "gameVersion": highestEntry.gameVersion || "jd2020",
        "rank": highestEntry.rank || 1,
        "name": highestEntry.name,
        "avatar": highestEntry.avatar,
        "country": highestEntry.country,
        "platformId": highestEntry.platformId,
        "alias": highestEntry.alias,
        "aliasGender": highestEntry.aliasGender,
        "jdPoints": highestEntry.jdPoints,
        "portraitBorder": highestEntry.portraitBorder
      };

      res.json(dancerOfTheWeek);
    } catch (error) {
      console.error(`[LEADERBOARD] Error in handleDancerOfTheWeek: ${error.message}`);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Handle regular leaderboard requests
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   * @param {string} mapName - The map name
   * @private
   */
  async handleRegularLeaderboard(req, res, mapName) {
    const leaderboardData = {
      "__class": "LeaderboardList",
      "entries": []
    };
    const db = getDb();

    try {
      const leaderboardEntries = await new Promise((resolve, reject) => {
        db.all('SELECT profileId, username, score, name, avatar, country, platformId, alias, aliasGender, jdPoints, portraitBorder FROM leaderboard WHERE mapName = ? ORDER BY score DESC LIMIT 6', [mapName], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (leaderboardEntries.length > 0) {
        let rank = 0;
        leaderboardData.entries = leaderboardEntries.map(entry => {
          rank++;
          return {
            "__class": "LeaderboardEntry_Online",
            "profileId": entry.profileId,
            "score": entry.score,
            "name": entry.name || entry.username,
            "avatar": entry.avatar,
            "rank": rank,
            "country": entry.country,
            "platformId": entry.platformId,
            "alias": entry.alias,
            "aliasGender": entry.aliasGender,
            "jdPoints": entry.jdPoints,
            "portraitBorder": entry.portraitBorder,
            "mapName": mapName
          };
        });
      }
      res.json(leaderboardData);
    } catch (error) {
      console.error(`[LEADERBOARD] Error in handleRegularLeaderboard: ${error.message}`);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Handle coop points requests
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   */
  handleCoopPoints(req, res) {
    res.send(core.leaderboard);
  }
}

// Export an instance of the route handler
module.exports = new LeaderboardRouteHandler();
