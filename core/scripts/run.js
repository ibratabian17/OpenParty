const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class ProcessManager {
  constructor() {
    this.outputLogs = [];
    this.requestLogs = [];
    this.process = null;
    this.restartCount = 0;
    this.maxRestarts = 10;
    this.restartDelay = 1000;
    this.logPath = path.join(__dirname, '../database/data/tmp/logs.txt');
    this.logger = new Logger('PARTY');
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  start() {
    this.process = spawn('node', ['server.js'], {
      stdio: 'pipe',
      detached: false
    });

    this.process.stdout.on('data', (data) => {
      this.logOutput('INFO', data.toString().trim());
    });

    this.process.stderr.on('data', (data) => {
      this.logOutput('ERROR', data.toString().trim());
    });

    this.process.on('exit', (code) => {
      this.logger.info(`Process exited with code ${code}`);
      
      if (code === 42) {
        if (this.restartCount < this.maxRestarts) {
          this.logger.info(`Restarting process in ${this.restartDelay}ms...`);
          setTimeout(() => this.start(), this.restartDelay);
          this.restartCount++;
        } else {
          this.logger.error('Max restart attempts reached');
        }
      }
    });
  }

  logOutput(level, message) {
    // Use the logger for output
    if (level === 'INFO') {
      this.logger.info(message);
    } else if (level === 'ERROR') {
      this.logger.error(message);
    }
    
    const log = {
      level,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.outputLogs.push(log);
    if (this.outputLogs.length > 100) {
      this.outputLogs.shift();
    }

    fs.appendFileSync(this.logPath, JSON.stringify(log) + '\n');
  }

  generateLog(req, res, next) {
    if (!req.url.startsWith('/party/panel/')) {
      const log = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip
      };
      
      this.requestLogs.push(log);
      if (this.requestLogs.length > 50) {
        this.requestLogs.shift();
      }
      
      fs.appendFileSync(this.logPath, JSON.stringify(log) + '\n');
    }
    next();
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

const manager = new ProcessManager();
manager.start();

// Handle process signals
process.on('SIGINT', () => {
  manager.logger.info('Gracefully shutting down...');
  manager.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  manager.logger.info('Terminating...');
  manager.stop();
  process.exit(0);
});

module.exports = manager;
