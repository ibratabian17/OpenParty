//JDPARTY CLONE OBJECT
const fs = require('fs');
const axios = require('axios');
const os = require('os');
const path = require('path');
const settings = require('../settings.json');
const downloader = {
};
function CloneObject(ObjectC) {
  return JSON.parse(JSON.stringify(ObjectC))
}
function readDatabaseJson(path) {
  return JSON.parse(fs.readFileSync(`${__dirname}/../database/${path}`, 'utf8'));
}
var donotlog = {}

downloader.getJson = async (url, options) => {
  const response = await axios.get(url, options);
  return response.data;
}

function extractSkuIdInfo(url) {
  // Split the URL by '/'
  const parts = url.split('/');
  // Get the last part of the URL
  const lastPart = parts[parts.length - 1];
  // Remove the file extension (.json)
  const filename = lastPart.split('.')[0];
  const filenameParts = filename.split('-');
  let version = filenameParts[0];
  version = version.slice(2);
  const platform = filenameParts[1];
  const type = filenameParts.slice(2).join('-')
  return { version, platform, type };
}

function getSavefilePath() {
  var isWin = process.platform === "win32";
  var path = ""
  if (isWin) {
    path = settings.server.SaveData.windows.replace('{Home}', os.homedir())
  } else {
    path = settings.server.SaveData.linux.replace('{Home}', os.homedir())
  }
  return path
}


//Check Savedata Dir before starting
if (!fs.existsSync(getSavefilePath())) {
  console.log(`[HELPER] ${getSavefilePath()} Doesn't Exist!`)
  fs.mkdirSync(getSavefilePath());
  fs.mkdirSync(path.join(getSavefilePath(), 'account/profiles'), { recursive: true });
  fs.mkdirSync(path.join(getSavefilePath(), 'carousel/pages'), { recursive: true });
  fs.mkdirSync(path.join(getSavefilePath(), 'Platforms/openparty-all'), { recursive: true });
  fs.mkdirSync(path.join(getSavefilePath(), 'leaderboard/dotw'), { recursive: true });
  fs.mkdirSync(path.join(getSavefilePath(), 'server-log'), { recursive: true });
}

function loadJsonFile(layeredPath, originalPath) {
  const savedDataPath = path.join(getSavefilePath(), layeredPath);
  if (fs.existsSync(savedDataPath)) {
    return require(savedDataPath);
  } else {
    if (!donotlog[path.basename(savedDataPath)]) {
      console.log(`[HELPER] Serving ${path.basename(savedDataPath)} from Static Database`)
      donotlog[path.basename(savedDataPath)] = true
    }
    return require(originalPath);
  }
}


module.exports = {
  CloneObject, readDatabaseJson, downloader, extractSkuIdInfo, getSavefilePath, loadJsonFile
}