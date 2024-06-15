//This script will automatically generate songdb for specific platform
const fs = require('fs')
const path = require('path')

function mergeJSON(obj1, obj2) {
    // Create a shallow copy of obj1 to avoid modifying it directly
    var merged = Object.assign({}, obj1);
  
    for (var key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj2[key] === 'object' && obj1.hasOwnProperty(key) && typeof obj1[key] === 'object') {
          // Recursive merge if both values are objects
          merged[key] = mergeJSON(obj1[key], obj2[key]);
        } else {
          // Only assign the value if it doesn't exist in obj1
          if (!obj1.hasOwnProperty(key)) {
            merged[key] = obj2[key];
          }
        }
      }
    }
  
    return merged;
  }

function generateSongdb(){
var tempAssets = {
        "banner_bkgImageUrl": "",
        "coach1ImageUrl": "",
        "coverImageUrl": "",
        "coverKidsImageUrl": "",
        "coverKids_smallImageUrl": "",
        "cover_1024ImageUrl": "",
        "cover_smallImageUrl": "",
        "expandBkgImageUrl": "",
        "expandCoachImageUrl": "",
        "map_bkgImageUrl": "",
        "phoneCoach1ImageUrl": "",
        "phoneCoverImageUrl": ""
}
var origin = mergeJSON(JSON.parse(fs.readFileSync(path.join(__dirname, 'openparty-all/unused/songdb_nx.json'))), JSON.parse(fs.readFileSync(path.join(__dirname, 'openparty-all/unused/songdbs.json'))))
var originpc = JSON.parse(fs.readFileSync(path.join(__dirname, 'openparty-all/unused/songdb_pc.json')))
var originx1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'openparty-all/unused/songdb_xone.json')))
var originps4 = JSON.parse(fs.readFileSync(path.join(__dirname, 'openparty-all/unused/songdb_ps4.json')))
var origincommon = JSON.parse(fs.readFileSync(path.join(__dirname, 'openparty-all/unused/songdb_common.json')))
var pc = {}

Object.keys(origin).forEach((currentSong) => {
const a = origin[currentSong]
const assets = a.assets
a.assets = {
    nx: assets,
    x1: originx1[currentSong] ? originx1[currentSong].assets : originpc[currentSong] ? originpc[currentSong].assets : tempAssets,
    ps4: originps4[currentSong] ? originps4[currentSong].assets : tempAssets,
    common: origincommon[currentSong] ? origincommon[currentSong].assets : tempAssets
}
pc[currentSong] = a;
})

var o = fs.writeFileSync(path.join(__dirname, 'openparty-all/songdbs.json'), JSON.stringify(pc, null, 2))
}

generateSongdb()