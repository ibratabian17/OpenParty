var sdb = require('./openparty-all/songdbs.json');
var ahud = require('./jd2017-nx/sku-packages.json');
var bhud = Object.keys(ahud);

var missingElements = [];

for (var key in sdb) {
  if (sdb.hasOwnProperty(key) ){
    if (bhud.indexOf(key + "_mapContent") === -1) {
      missingElements.push(key);
    }
  }
}

console.log(JSON.stringify(missingElements));
