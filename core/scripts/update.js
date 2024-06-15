function restartPM2() {
    const { exec } = require('child_process');
    console.log('[UPDATER] PM2 Process Detected, Running In PM2 Way ...');
    console.log('[UPDATER] Pulling Upstream Before Restarting ...');

    // Execute Git pull
    exec('git pull', (err, stdout, stderr) => {
        if (err) {
            console.error(`[UPDATER] Failed to execute git pull: ${err.message}`);
            return;
        }

        // Check if package.json has been modified
        console.log('[UPDATER] Checking package.json ...');
        exec('git diff --name-only package.json', (err, stdout, stderr) => {
            if (err) {
                console.error(`[UPDATER] Failed to check for package.json modifications: ${err.message}`);
                return;
            }

            if (stdout.trim() !== '') {
                console.log('[UPDATER] package.json has been modified. Running npm install...');
                // Execute npm install
                exec('npm install', (err, stdout, stderr) => {
                    if (err) {
                        console.error(`[UPDATER] Failed to execute npm install: ${err.message}`);
                        return;
                    }

                    console.log('[UPDATER] npm install completed successfully.');
                });
            } else {
                console.log('[UPDATER] No modifications detected in packages.json. Skipping npm install.');
            }

            // Restart Node.js process using PM2
            console.log('[UPDATER] Restarting Server');
            pm2.connect((err) => {
                if (err) {
                    console.error(`[UPDATER] Failed to connect to PM2: ${err.message}`);
                    return;
                }

                console.log('[UPDATER] restarting Node.js process...');
                pm2.restart('JDPartyServer', (err) => {
                    if (err) {
                        console.error(`[UPDATER] Failed to restart Node.js process: ${err.message}`);
                    } else {
                        console.log('[UPDATER] Node.js process restarted successfully.');
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
    console.log('[UPDATER] Pulling Upstream Before Starting ...');

    // Execute Git pull
    exec('git pull', (err, stdout, stderr) => {
        if (err) {
            console.error(`[UPDATER] Failed to execute git pull: ${err.message}`);
            return;
        }

        // Check if package.json has been modified
        console.log('[UPDATER] Checking package.json ...');
        exec('git diff --name-only package.json', (err, stdout, stderr) => {
            if (err) {
                console.error(`[UPDATER] Failed to check for package.json modifications: ${err.message}`);
                return;
            }

            if (stdout.trim() !== '') {
                console.log('[UPDATER] package.json has been modified. Running npm install...');
                // Execute npm install
                exec('npm install', (err, stdout, stderr) => {
                    if (err) {
                        console.error(`[UPDATER] Failed to execute npm install: ${err.message}`);
                        return;
                    }

                    console.log('[UPDATER] npm install completed successfully.');
                });
            } else {
                console.log('[UPDATER] No modifications detected in packages.json. Skipping npm install.');
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
