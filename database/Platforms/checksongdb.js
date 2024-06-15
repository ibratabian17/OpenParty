var sdb = require('./openparty-all/songdbs.json');
var ahud = require('./jd2017-nx/sku-packages.json');

var missingElements = [];

for (var key in ahud) {
  if (ahud.hasOwnProperty(key)) {
    // Check if the corresponding key without "_mapContent" exists in sdb
    if (!sdb[key.replace("_mapContent", "")]) {
        if(!key.includes("bossContent") && !key.includes("JDM"))missingElements.push(key);
    }
  }
}

console.log(JSON.stringify(missingElements));
