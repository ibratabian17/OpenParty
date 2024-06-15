//JDPARTY CLONE OBJECT
const fs = require('fs');
const axios = require('axios');
const downloader = {
};
function CloneObject(ObjectC) {
    return JSON.parse(JSON.stringify(ObjectC))
}
function readDatabaseJson(path) {
    return JSON.parse(fs.readFileSync(`${__dirname}/../database/${path}`, 'utf8'));
}

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
  

module.exports = {
    CloneObject, readDatabaseJson, downloader, extractSkuIdInfo
}