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
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`[HELPER] Created directory: ${dirPath}`);
  }
};

const baseDir = getSavefilePath();
console.log(`[HELPER] Checking SaveData dir`);

// Pastikan direktori utama ada
ensureDirectoryExists(baseDir);

// Pastikan semua subfolder ada
const directoriesToEnsure = [
  'account/profiles',
  'carousel/pages',
  'Platforms/openparty-all',
  'leaderboard/dotw',
  'server-log',
  'wdf',
];

directoriesToEnsure.forEach((relativePath) => {
  const fullPath = path.join(baseDir, relativePath);
  ensureDirectoryExists(fullPath);
});


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

function resolvePath(input=""){
  var new_input = input.replace('{dirname}', process.cwd())
  new_input = new_input.replace('{Home}', os.homedir())
  return new_input
}


module.exports = {
  CloneObject, readDatabaseJson, downloader, extractSkuIdInfo, getSavefilePath, loadJsonFile, resolvePath
}