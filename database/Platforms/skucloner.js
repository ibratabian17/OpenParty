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

  fs.writeFileSync(path.join(__dirname, 'jd2017-pc/sku-packages.json'), JSON.stringify(mergeJSON(JSON.parse(fs.readFileSync(path.join(__dirname, 'jd2017-pc/sku-packages-a.json'))), JSON.parse(fs.readFileSync(path.join(__dirname, 'jd2017-pc/skuc.json')))), null, 2))