const fs = require("fs");
const axios = require("axios");
const path = require('path');
const { getSavefilePath } = require('../helper');
const { encrypt, decrypt } = require('../lib/encryptor');

const secretKey = require('../../database/encryption.json').encrpytion.userEncrypt;
const ubiwsurl = "https://public-ubiservices.ubi.com";
const prodwsurl = "https://prod.just-dance.com";
let decryptedData = null;
let cachedLeaderboard = null;
let cachedDotw = null;

const LEADERBOARD_PATH = path.join(getSavefilePath(), 'leaderboard/leaderboard.json');
const DOTW_PATH = path.join(getSavefilePath(), 'leaderboard/dotw.json');

// Helper function to load user data
function loadUserData(dataFilePath) {
  if (!decryptedData) {  // Load data from disk only if not already in memory
    try {
      const encryptedData = fs.readFileSync(dataFilePath, 'utf8');
      decryptedData = JSON.parse(decrypt(encryptedData, secretKey));
    } catch (err) {
      console.log('[ACC] Unable to read user.json');
      console.log('[ACC] Is the key correct? Are the files corrupted?');
      console.log('[ACC] Ignore this message if this is the first run');
      console.log('[ACC] Resetting All User Data...');
      console.log(err);
      decryptedData = {};  // Initialize as an empty object if file read fails
    }
  }
  return decryptedData;
}

function getWeekNumber() {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), 0, 1);
  const daysSinceStartOfWeek = Math.floor((now - startOfWeek) / (24 * 60 * 60 * 1000));
  return Math.ceil((daysSinceStartOfWeek + 1) / 7);
}

// Helper function to save user data
function saveUserData(dataFilePath, data) {
  const encryptedUserProfiles = encrypt(JSON.stringify(data), secretKey);
  fs.writeFileSync(dataFilePath, encryptedUserProfiles);
}

// Find user by ticket
function findUserFromTicket(ticket) {
  return Object.values(decryptedData).find(profile => profile.ticket === ticket);
}

// Find user by nickname
function findUserFromNickname(nickname) {
  return Object.values(decryptedData).find(profile => profile.name === nickname);
}

const getGameVersion = (req) => {
  const sku = req.header('X-SkuId') || "jd2019-pc-ww";
  return sku.substring(0, 6) || "jd2019";
};

// Add a new user
function addUser(profileId, userProfile) {
  decryptedData[profileId] = userProfile;
  console.log(`[ACC] Added User With UUID: `, profileId);
  const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`);
  saveUserData(dataFilePath, decryptedData);
}

function findUserFromTicket(ticket) {
  return Object.values(decryptedData).find(profile => profile.ticket === ticket);
}

// Helper function to read the leaderboard
function readLeaderboard(isDotw = false) {
  if (!isDotw) {
    if (!cachedLeaderboard) {
      if (fs.existsSync(LEADERBOARD_PATH)) {
        const data = fs.readFileSync(LEADERBOARD_PATH, 'utf-8');
        cachedLeaderboard = data
        return JSON.parse(data);
      } else {
        return cachedLeaderboard
      }
    }
    return {}; // Return empty object if file doesn't exist
  } else {
    if (!cachedDotw) {
      if (fs.existsSync(DOTW_PATH)) {
        const data = fs.readFileSync(DOTW_PATH, 'utf-8');
        cachedDotw = data
        return JSON.parse(data);
      } else {
        return cachedDotw
      }
    }
    return {}; // Return empty object if file doesn't exist
  }
}
function generateLeaderboard(UserDataList, req) {
  // Initialize an empty leaderboard object
  const leaderboard = {};
  // Iterate over each user profile
  Object.entries(UserDataList).forEach(([profileId, userProfile]) => {
    if (userProfile.scores) {
      // Iterate over the user's scores for each map
      Object.entries(userProfile.scores).forEach(([mapName, scoreData]) => {
        // Initialize the leaderboard for the map if it doesn't exist
        if (!leaderboard[mapName]) {
          leaderboard[mapName] = [];
        }

        // Create a leaderboard entry for this user on this map
        const leaderboardEntry = {
          __class: "LeaderboardEntry",
          score: scoreData.highest, // Assuming 'highest' is the correct property for the highest score
          profileId: profileId,
          gameVersion: 'jd2019', // Implement the getGameVersion method if needed
          rank: userProfile.rank,
          name: userProfile.name,
          avatar: userProfile.avatar,
          country: userProfile.country,
          platformId: userProfile.platformId,
          alias: userProfile.alias,
          aliasGender: userProfile.aliasGender,
          jdPoints: userProfile.jdPoints,
          portraitBorder: userProfile.portraitBorder
        };

        // Add the leaderboard entry to the map's leaderboard
        leaderboard[mapName].push(leaderboardEntry);
      });
    }
  });
  console.log('[LEADERBOARD] Leaderboard List Regenerated')
  return leaderboard;
}


// Helper function to save the leaderboard
function saveLeaderboard(leaderboard, isDotw = false) {
  fs.writeFileSync(isDotw ? DOTW_PATH : LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2));
}

// Initialize routes
exports.initroute = (app) => {

  // Endpoint to get profiles based on profileIds
  app.get("/profile/v2/profiles", async (req, res) => {
    const ticket = req.header("Authorization");
    const profileIds = req.query.profileIds.split(',');
    const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`);

    // Load user data if not already loaded
    if (!decryptedData) {
      loadUserData(dataFilePath);
    }

    const responseProfiles = await Promise.all(profileIds.map(async (profileId) => {
      let userProfile = decryptedData[profileId];

      // If the profile is found in the local data
      if (userProfile && Object.keys(userProfile).length >= 2) {
        console.log(`[ACC] Account Found For: `, profileId);
        return { ...userProfile, ip: req.clientIp, ticket: ticket };
      } else {
        // If the profile is not found locally, fetch from external source
        console.log(`[ACC] Asking Official Server For: `, profileId);
        const url = `https://prod.just-dance.com/profile/v2/profiles?profileIds=${encodeURIComponent(profileId)}`;
        // Modify headers by omitting the Host header
        const headers = { ...req.headers };
        delete headers.host;
        try {
          const profileResponse = await axios.get(url, {
            headers 
          });

          // Assume the external response contains the profile as `profileData`
          const profileData = profileResponse.data[0]; // Adjust according to the actual response format
          if (profileData) {
            console.log(`[ACC] Account Saved to the server: `, profileId);
            const defaultProfile = { ...profileData, ip: req.clientIp, ticket: ticket };

            // Add the fetched profile to local storage
            addUser(profileId, defaultProfile);

            return defaultProfile;
          }
        } catch (error) {
          console.error(`[ACC] Error fetching profile for ${profileId}:`, error.message);
          addUser(profileId, { ip: req.clientIp, ticket: ticket });
          return {}; // If fetch fails, return an empty profile object
        }
      }
    }));

    res.send(responseProfiles);
  });


  app.post("/profile/v2/profiles", (req, res) => {
    const ticket = req.header("Authorization");
    const content = req.body;
    content.ticket = ticket;
    const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`);
  
    // Load user data if not already loaded
    if (!decryptedData) {
      loadUserData(dataFilePath);
    }
  
    // Find matching profile by name or ticket
    const matchedProfileId = Object.keys(decryptedData).find(profileId => {
      const userProfile = decryptedData[profileId];
      return userProfile.name === content.name || userProfile.ticket === ticket;
    });
  
    if (matchedProfileId) {
      const userProfile = decryptedData[matchedProfileId];
  
      // Merge new content into existing user profile, overriding or adding properties
      Object.assign(userProfile, content);
  
      // Save updated user profile data
      decryptedData[matchedProfileId] = userProfile;
      saveUserData(dataFilePath, decryptedData);

      // Regenerate Leaderboard List
      const leaderboardlist = generateLeaderboard(decryptedData)
      saveLeaderboard(leaderboardlist, false);
  
      res.send(decryptedData[matchedProfileId]);
    } else {
      console.error("[ACC] Can't Find UUID: ", matchedProfileId);
      res.status(404).send("Profile not found.");
    }
  });


  app.post("/profile/v2/map-ended", async (req, res) => {
    const ticket = req.header("Authorization");
    const clientIp = req.ip;

    try {
      const mapList = req.body;
      let leaderboard = readLeaderboard(true);  // Load the current leaderboard data

      for (let song of mapList) {
        core.updateMostPlayed(song.mapName);

        // Initialize the map in the leaderboard if it doesn't exist
        if (!leaderboard[song.mapName]) {
          leaderboard[song.mapName] = [];
        }

        // Find the user profile
        const profile = findUserFromTicket(ticket);
        if (!profile) {
          return res.send('1');
        }

        // Check if an entry for this profileId already exists
        const currentScores = leaderboard[song.mapName];
        const existingEntryIndex = currentScores.findIndex(entry => entry.profileId === profile.profileId);

        if (existingEntryIndex !== -1) {
          // Entry exists for this profile, update if the new score is higher
          if (currentScores[existingEntryIndex].score < song.score) {
            currentScores[existingEntryIndex].score = song.score;
            console.log(`[LEADERBOARD] Updated score dotw list on map ${song.mapName}`);
          } else {
            return res.send('1'); // Do nothing if the new score is lower
          }
        } else {
          // No existing entry for this profile, add a new one
          const newScoreEntry = {
            __class: "LeaderboardEntry",
            score: song.score,
            profileId: profile.profileId,
            gameVersion: getGameVersion(req),
            rank: profile.rank,
            name: profile.name,
            avatar: profile.avatar,
            country: profile.country,
            platformId: profile.platformId,
            alias: profile.alias,
            aliasGender: profile.aliasGender,
            jdPoints: profile.jdPoints,
            portraitBorder: profile.portraitBorder,
            weekOptain: getWeekNumber()
          };

          currentScores.push(newScoreEntry);
          leaderboard[song.mapName] = currentScores
          console.log(`[LEADERBOARD] Added new score for ${profile.name} on map ${song.mapName}`);
        }
      }

      // Save the updated leaderboard back to the file
      saveLeaderboard(leaderboard, true);
      res.send('');

    } catch (error) {
      console.log(error);
      res.status(200).send('');  // Keep sending response even in case of error
    }
  });

  // Delete favorite map
  app.delete("/profile/v2/favorites/maps/:MapName", async (req, res) => {
    try {
      const MapName = req.params.MapName;
      const ticket = req.header("Authorization");
      const SkuId = req.header("X-SkuId");

      const response = await axios.delete(
        `${prodwsurl}/profile/v2/favorites/maps/${MapName}`, {
        headers: {
          "X-SkuId": SkuId,
          Authorization: ticket,
        },
      });

      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // Get profile sessions
  app.get("/v3/profiles/sessions", async (req, res) => {
    try {
      const ticket = req.header("Authorization");
      const appid = req.header("Ubi-AppId");

      const response = await axios.get(`${ubiwsurl}/v3/profiles/sessions`, {
        headers: {
          "Content-Type": "application/json",
          "Ubi-AppId": appid,
          Authorization: ticket,
        },
      });

      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  // Endpoint to filter players
  app.post("/profile/v2/filter-players", (req, res) => {
    res.send(["00000000-0000-0000-0000-000000000000"]);
  });
}
