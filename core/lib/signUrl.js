const crypto = require('crypto');
const settings = require('../../settings.json')
const secretKey = settings.server.encrpytion.secretKey;

exports.generateSignedURL = (originalURL) => {
    // Set expiration time (in seconds)
    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // Generate the string to sign
    const stringToSign = `exp=${expirationTime}~acl=/private/songdb/prod/*`;

    // Create HMAC (SHA-256) of the string to sign using the secret key
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(stringToSign);
    const signature = hmac.digest('hex');

    // Append the signature and expiration time to the original URL
    const signedURL = `${originalURL}?auth=${stringToSign}~hmac=${signature}`;
    
    return signedURL;
}

exports.verifySignedURL = (signedURL) => {
    // Extract signature and expiration time from the signed URL
    const urlParts = signedURL.split('?');
    if (urlParts.length !== 2) {
        return false; // Invalid URL format
    }

    const queryParams = urlParts[1].split('~');
    const signatureParam = queryParams.find(param => param.startsWith('auth='));
    const hmacParam = queryParams.find(param => param.startsWith('hmac='));

    if (!signatureParam || !hmacParam) {
        return false; // Signed URL format is invalid
    }

    const expire = signatureParam.split('=')[2];
    const hmac = hmacParam.split('=')[1];

    // Extract expiration time from the signature
    const expirationTimeStr = expire;
    const expirationTime = parseInt(expirationTimeStr, 10);

    // Ensure the current time is before the expiration time
    if (Date.now() / 1000 > expirationTime) {
        return false; // URL has expired
    }

    // Recreate the string to sign
    const stringToSign = `exp=${expirationTimeStr}~acl=/private/songdb/prod/*`;

    // Compute HMAC using the secret key
    const hmacVerifier = crypto.createHmac('sha256', secretKey);
    hmacVerifier.update(stringToSign);
    const computedHmac = hmacVerifier.digest('hex');

    // Compare computed HMAC with extracted HMAC
    return computedHmac === hmac;
}
