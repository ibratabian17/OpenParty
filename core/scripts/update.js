const Logger = require('../utils/logger');
const logger = new Logger('UPDATER');

function restartPM2() {
    const { exec } = require('child_process');
    logger.info('PM2 Process Detected, Running In PM2 Way ...');
    logger.info('Pulling Upstream Before Restarting ...');

    // Execute Git pull
    exec('git pull', (err, stdout, stderr) => {
        if (err) {
            logger.error(`Failed to execute git pull: ${err.message}`);
            return;
        }

        // Check if package.json has been modified
        logger.info('Checking package.json ...');
        exec('git diff --name-only package.json', (err, stdout, stderr) => {
            if (err) {
                logger.error(`Failed to check for package.json modifications: ${err.message}`);
                return;
            }

            if (stdout.trim() !== '') {
                logger.info('package.json has been modified. Running npm install...');
                // Execute npm install
                exec('npm install', (err, stdout, stderr) => {
                    if (err) {
                        logger.error(`Failed to execute npm install: ${err.message}`);
                        return;
                    }

                    logger.info('npm install completed successfully.');
                });
            } else {
                logger.info('No modifications detected in packages.json. Skipping npm install.');
            }

            // Restart Node.js process using PM2
            logger.info('Restarting Server');
            pm2.connect((err) => {
                if (err) {
                    logger.error(`Failed to connect to PM2: ${err.message}`);
                    return;
                }

                logger.info('restarting Node.js process...');
                pm2.restart('JDPartyServer', (err) => {
                    if (err) {
                        logger.error(`Failed to restart Node.js process: ${err.message}`);
                    } else {
                        logger.info('Node.js process restarted successfully.');
                    }
                    pm2.disconnect();
                });
            });
        });
    });
}
function updateNormal(server) {
    const { exec } = require('child_process');
    const pm2 = require('pm2');
    logger.info('Pulling Upstream Before Starting ...');

    // Execute Git pull
    exec('git pull', (err, stdout, stderr) => {
        if (err) {
            logger.error(`Failed to execute git pull: ${err.message}`);
            return;
        }

        // Check if package.json has been modified
        logger.info('Checking package.json ...');
        exec('git diff --name-only package.json', (err, stdout, stderr) => {
            if (err) {
                logger.error(`Failed to check for package.json modifications: ${err.message}`);
                return;
            }

            if (stdout.trim() !== '') {
                logger.info('package.json has been modified. Running npm install...');
                // Execute npm install
                exec('npm install', (err, stdout, stderr) => {
                    if (err) {
                        logger.error(`Failed to execute npm install: ${err.message}`);
                        return;
                    }

                    logger.info('npm install completed successfully.');
                });
            } else {
                logger.info('No modifications detected in packages.json. Skipping npm install.');
            }
            process.exit(42)
        });
    });
}

function restart(server) {
    if (process.env.pm_id == undefined) {
        updateNormal(server)
    } else {
        restartPM2()
    }
}

module.exports = {
    restart
};
