const fs = require("fs");
const axios = require("axios");
const path = require('path');
const { getSavefilePath } = require('../helper');
const { encrypt, decrypt } = require('../lib/encryptor');
const { updateMostPlayed } = require('../carousel/carousel');

const secretKey = require('../../database/encryption.json').encrpytion.userEncrypt;
const ubiwsurl = "https://public-ubiservices.ubi.com";
const prodwsurl = "https://prod.just-dance.com";
let decryptedData;
let cachedLeaderboard;
let cachedDotw;

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
  const matchedProfileId = Object.keys(decryptedData).find(profileId => {
    const userProfile = decryptedData[profileId];
    return userProfile.ticket === ticket && userProfile.name;
  });
  return matchedProfileId
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
// Add a new user
function addUserId(profileId, userId) {
  if (decryptedData[profileId]) {
    decryptedData[profileId].userId = userId;
    const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`);
    saveUserData(dataFilePath, decryptedData);
  } else {
    console.log(`[ACC] User ${profileId} not found`)
  }
}

function updateUserTicket(profileId, Ticket) {
  decryptedData[profileId.ticket] = Ticket;
  const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`);
  saveUserData(dataFilePath, decryptedData);
}

// Update or override user data
function updateUser(profileId, userProfile) {
  if (!decryptedData[profileId]) {
      console.log(`[ACC] User ${profileId} not found. Creating new user.`);
      decryptedData[profileId] = userProfile; // Create a new profile
  } else {
      // Merge new data into the existing profile
      decryptedData[profileId] = {
          ...decryptedData[profileId], // Existing data
          ...userProfile              // New data to override specific fields
      };
  }

  // Save the updated data
  const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`);
  saveUserData(dataFilePath, decryptedData);
}


// Retrieve user data
function getUserData(profileId) {
  if (decryptedData[profileId]) {
      return decryptedData[profileId];
  } else {
      console.log(`[ACC] User ${profileId} not found.`);
      return null;
  }
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
        return cachedLeaderboard || {}
      }
    }
    return JSON.parse(Leaderboard); // Return empty object if file doesn't exist
  } else {
    if (!cachedDotw) {
      if (fs.existsSync(DOTW_PATH)) {
        const data = fs.readFileSync(DOTW_PATH, 'utf-8');
        cachedDotw = data
        return JSON.parse(data);
      } else {
        return cachedDotw || {}
      }
    }
    return JSON.parse(cachedDotw); // Return empty object if file doesn't exist
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

//Load User Data
if (!decryptedData) {
  const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`);
  loadUserData(dataFilePath);
}

module.exports = {
  loadUserData,
  addUser,
  addUserId,
  getUserData,
  updateUser,
  updateUserTicket,
  cachedLeaderboard,
  cachedDotw,
  initroute: (app) => {

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
        if (userProfile && userProfile.name) {
          console.log(`[ACC] Account Found For: `, profileId);
          if (!findUserFromTicket(ticket)) {
            decryptedData[profileId].ticket = ticket;
            console.log('[ACC] Updated Ticket For ', userProfile.name)
          }
          return { ...userProfile, ip: req.clientIp, ticket: '', profileId };
        } else {
          // If the profile is not found locally, fetch from external source
          console.log(`[ACC] Asking Official Server For: `, profileId);
          const url = `https://prod.just-dance.com/profile/v2/profiles?profileIds=${encodeURIComponent(profileId)}`;
          try {
            const profileResponse = await axios.get(url, {
              headers: {
                'Host': 'prod.just-dance.com',
                'User-Agent': req.headers['user-agent'],
                'Accept': req.headers['accept'] || '/',
                'Accept-Language': 'en-us,en',
                'Authorization': req.headers['authorization'],
                'X-SkuId': req.headers['x-skuid'],
              }
            });

            // Assume the external response contains the profile as `profileData`
            const profileData = profileResponse.data[0]; // Adjust according to the actual response format
            if (profileData) {
              console.log(`[ACC] Account Saved to the server: `, profileId);
              const defaultProfile = { ...profileData, ip: req.clientIp, ticket: ticket };

              // Add the fetched profile to local storage
              addUser(profileId, defaultProfile);

              defaultProfile.ticket = ''

              return defaultProfile;
            }
          } catch (error) {
            console.error(`[ACC] Error fetching profile for ${profileId}:`, error.message);
            addUser(profileId, { ip: req.clientIp, ticket: ticket });
            return {
              "profileId": profileId,
              "isExisting": false
            }; // If fetch fails, return an empty profile object
          }
        }
      }));

      res.send(responseProfiles);
    });


    app.post("/profile/v2/profiles", (req, res) => {
      try {
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

          if (!matchedProfileId.name && userProfile.name) {
            console.log('[ACC] New User Registered: ', userProfile.name)
          }

          // Merge new content into existing user profile, overriding or adding properties
          Object.assign(userProfile, content);

          // Save updated user profile data
          decryptedData[matchedProfileId] = userProfile;
          console.error("[ACC] Updated User ", matchedProfileId);
          saveUserData(dataFilePath, decryptedData);

          // Regenerate Leaderboard List
          const leaderboardlist = generateLeaderboard(decryptedData)
          saveLeaderboard(leaderboardlist, false);

          res.send(decryptedData[matchedProfileId]);
        } else {
          console.error("[ACC] Can't Find UUID: ", matchedProfileId);
          res.status(404).send("Profile not found.");
        }
      } catch (err) {
        console.log(err)
      }
    });


    app.post("/profile/v2/map-ended", async (req, res) => {
      const ticket = req.header("Authorization");
      const SkuId = req.header("X-SkuId") || "jd2019";
      const clientIp = req.ip;

      try {
        const mapList = req.body;
        var leaderboard = readLeaderboard(true);  // Load the current leaderboard data

        for (let song of mapList) {
          updateMostPlayed(song.mapName);

          // Initialize the map in the leaderboard if it doesn't exist
          if (!leaderboard[song.mapName]) {
            console.log(`${JSON.stringify(leaderboard)} doesnt exist`)
            leaderboard[song.mapName] = [];
          }

          // Find the user profile
          const profile = findUserFromTicket(ticket);
          if (!profile) {
            console.log('[DOTW] Unable to find the Profile')
            return res.send('1');
          }
          const currentProfile = decryptedData[profile]
          if (!currentProfile) {
            console.log('[DOTW] Unable to find Pid: ', currentProfile)
            return res.send('1');
          }

          // Check if an entry for this profileId already exists
          const currentScores = leaderboard[song.mapName];
          const existingEntryIndex = currentScores.findIndex(entry => entry.profileId === profile);

          if (existingEntryIndex !== -1) {
            // Entry exists for this profile, update if the new score is higher
            if ((currentScores[existingEntryIndex].score < song.score) && song.score <= 13334) {
              currentScores[existingEntryIndex].score = song.score;
              currentScores[existingEntryIndex].weekOptain = getWeekNumber()
              console.log(`[DOTW] Updated score dotw list on map ${song.mapName}`);
            } else {
              return res.send('1'); // Do nothing if the new score is lower
            }
          } else {
            // No existing entry for this profile, add a new one
            const newScoreEntry = {
              __class: "DancerOfTheWeek",
              profileId: profile,
              score: song.score,
              gameVersion: SkuId.split('-')[0] || "jd2019",
              rank: currentProfile.rank,
              name: currentProfile.name,
              avatar: currentProfile.avatar,
              country: currentProfile.country,
              platformId: currentProfile.platformId,
              alias: currentProfile.alias,
              aliasGender: currentProfile.aliasGender,
              jdPoints: currentProfile.jdPoints,
              portraitBorder: currentProfile.portraitBorder,
              weekOptain: getWeekNumber()
            }

            currentScores.push(newScoreEntry);
            leaderboard[song.mapName] = currentScores
            console.log(`[DOTW] Added new score for ${currentProfile.name} on map ${song.mapName}`);
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
};