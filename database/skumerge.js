const fs = require('fs');

function mergeSKUs(sku1Data, sku2Data, sku3Data) {
    // Parsing SKU data from JSON
    const sku1 = JSON.parse(sku1Data);
    const sku2 = JSON.parse(sku2Data);
    const sku3 = JSON.parse(sku3Data);

    // Creating merged SKU object
    const mergedSKU = { ...sku1 };

    // Merging sku2 into mergedSKU, if keys don't already exist
    Object.keys(sku2).forEach(key => {
        if (!mergedSKU[key]) {
            mergedSKU[key] = sku2[key];
        }
    });

    // Merging sku3 into mergedSKU, if keys don't already exist in sku1 or sku2
    Object.keys(sku3).forEach(key => {
        if (!mergedSKU[key] && !sku2[key]) {
            mergedSKU[key] = sku3[key];
        }
    });

    return mergedSKU;
}

// Reading SKU data from input files
const sku1Data = fs.readFileSync('sku1.json', 'utf8');
const sku2Data = fs.readFileSync('sku2.json', 'utf8');
const sku3Data = fs.readFileSync('sku3.json', 'utf8');

// Merging SKUs
const mergedSKU = mergeSKUs(sku1Data, sku2Data, sku3Data);

// Writing merged SKU back to sku1.json
fs.writeFileSync('sku1.json', JSON.stringify(mergedSKU, null, 2));

console.log('Merged SKUs into sku1.json successfully.');
