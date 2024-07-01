// core/route/account.js
//shit implementation, i need to fix it asap
const fs = require("fs");
const axios = require("axios");
const path = require('path')
const { getSavefilePath } = require('../helper');


const hidepass = btoa('SkROZXh0Q2F1dGlvblBsZWFzZURvTm90U3RlYWxVc2VyRGF0YS4xMg==');

function encrypt(str, secretKey) {
  const encodedResult = Buffer.from(str).toString('base64');
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode);
  }
  return encodedResult;
}

function decrypt(str, secretKey) {
  const decodedStr = Buffer.from(str, 'base64').toString('ascii');
  let result = '';
  for (let i = 0; i < decodedStr.length; i++) {
    const charCode = decodedStr.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

exports.initroute = (app) => {
  const ubiwsurl = "https://public-ubiservices.ubi.com";
  const prodwsurl = "https://prod.just-dance.com";

  // Endpoint to get profiles based on profileIds
  app.get("/profile/v2/profiles", (req, res) => {
    const ticket = req.header("Authorization") || ''; // Extract Authorization header
    const profilesid = req.query.profileIds.split(','); // Split profileIds into an array
    const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`); // Path to user data file
    let decryptedData;
    try {
      const encryptedData = fs.readFileSync(dataFilePath, 'utf8'); // Read encrypted user data
      decryptedData = JSON.parse(encryptedData); // Parse decrypted user data
    } catch (err) {
      decryptedData = {}; // Set empty object if data cannot be parsed
    }

    // Map over profileIds to retrieve corresponding user profiles or create default profiles
    const responseProfiles = profilesid.map(profileId => {
      const userProfile = decryptedData[profileId]; // Get user profile based on profileId
      if (userProfile) {
        return { ...userProfile, ip: req.ip, ticket: ticket }; // Add IP to userProfile but not in the response
      } else {
        const defaultProfile = { ip: req.ip, ticket: ticket }; // Create a default profile with IP address
        decryptedData[profileId] = defaultProfile; // Add default profile to decrypted data
        return {}; // Return an empty object (don't include defaultProfile in response)
      }
    });

    const encryptedUserProfiles = JSON.stringify(decryptedData); // Stringify decrypted data
    fs.writeFileSync(dataFilePath, encryptedUserProfiles); // Write updated data to file
    res.send(responseProfiles); // Send response containing user profiles
  });

  // Endpoint to update or create a user profile
  app.post("/profile/v2/profiles", (req, res) => {
    const ticket = req.header("Authorization"); // Extract Authorization header
    const content = req.body; // Extract content from request body
    const dataFilePath = path.join(getSavefilePath(), `/account/profiles/user.json`); // Path to user data file
    let decryptedData;
    try {
      const encryptedData = fs.readFileSync(dataFilePath, 'utf8'); // Read encrypted user data
      decryptedData = JSON.parse(encryptedData); // Parse decrypted user data
    } catch (err) {
      decryptedData = {}; // Set empty object if data cannot be parsed
    }

    // Find a matching profile based on name or IP address (only one profile)
    // Check whether this user is a cracked game user
    if (content.name === "ALI123") {
      return res.status(400).send({
        error: "Cracked user is not allowed to use profiles"
      }); // Send 400 status with error message
    }
    const matchedProfileId = Object.keys(decryptedData).find(profileId => {
      const userProfile = decryptedData[profileId]; // Get user profile based on profileId
      return userProfile.name === content.name || userProfile.ticket === ticket || userProfile.ip === req.ip; // Check for name or IP match
    });

    if (matchedProfileId) {
      decryptedData[matchedProfileId] = content; // Update existing profile with posted content
      const encryptedUserProfiles = JSON.stringify(decryptedData); // Stringify decrypted data
      fs.writeFileSync(dataFilePath, encryptedUserProfiles); // Write updated data to file
      res.send(encryptedUserProfiles); // Send updated encrypted data as response
    } else {
      res.status(404).send("Profile not found."); // Send 404 status if profile not found
    }
  });

  app.delete("/profile/v2/favorites/maps/:MapName", async (req, res) => {
    try {
      var MapName = req.params.MapName;
      var ticket = req.header("Authorization");
      var SkuId = req.header("X-SkuId");
      var response = await axios.delete(
        prodwsurl + "/profile/v2/favorites/maps/" + MapName,
        {
          headers: {
            "X-SkuId": SkuId,
            Authorization: ticket,
          },
        }
      );
      res.send(response.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get("/v3/profiles/sessions", async (req, res) => {
    try {
      var ticket = req.header("Authorization");
      var appid = req.header("Ubi-AppId");
      var response = await axios.get(ubiwsurl + "/v3/profiles/sessions", {
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

  app.post("/profile/v2/filter-players", function (request, response) {
    response.send(["00000000-0000-0000-0000-000000000000"]);
  });
}
