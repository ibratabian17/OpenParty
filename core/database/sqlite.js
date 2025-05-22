const DatabaseManager = require('./DatabaseManager'); // Import the DatabaseManager class

async function initializeDatabase() {
    return DatabaseManager.getInstance().initialize();
}

function getDb() {
    return DatabaseManager.getInstance().getDb();
}

module.exports = {
    initializeDatabase,
    getDb
};
