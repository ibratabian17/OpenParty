const { spawnSync } = require('child_process');
const fs = require('fs');

let outputLogs = [];

function start() {
  const { stdout, stderr, status } = spawnSync('node', ['jduparty.js']);

  if (stdout) {
    const log = {
      method: 'LOG',
      url: stdout.toString().trim(),
      timestamp: new Date().toISOString()
    };
    outputLogs.push(log);

    fs.writeFileSync('database/tmp/logs.txt', JSON.stringify(outputLogs));
  }

  if (stderr) {
    const log = {
      method: 'LOG ERROR',
      url: stderr.toString().trim(),
      timestamp: new Date().toISOString()
    };
    outputLogs.push(log);

    fs.writeFileSync('database/tmp/logs.txt', JSON.stringify(outputLogs));
  }

  console.log(`[PARTY] child process exited with code ${status}`);
  if (status === 42) { // Replace 42 with your desired exit code
    start(); // Restart the process
  }
}

function generateLog(req, res, next) {
  counted++;
  if (!req.url.startsWith('/party/panel/')) {
    const log = {
      timestamp: new Date().toISOString(),
      message: `[PARTY] ${req.method} ${req.url}`
    };
    requestLogs.push(log);
    if (requestLogs.length > 50) {
      requestLogs.shift();
    }
    fs.appendFileSync('database/tmp/logs.txt', `${JSON.stringify(log)}\n`);
  }
  next();
}

start();

process.on('SIGINT', () => {
  process.exit();
});
