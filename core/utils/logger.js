const chalk = require('chalk');

class Logger {
    constructor(moduleName = 'APP') {
        this.moduleName = moduleName;
        this.moduleColor = this._getModuleColor(moduleName);
    }

    _getModuleColor(moduleName) {
        const colors = [
            chalk.default.cyanBright,
            chalk.default.magentaBright,
            chalk.default.yellowBright,
            chalk.default.blueBright,
            chalk.default.greenBright,
            chalk.default.redBright,
            chalk.default.whiteBright,
            chalk.default.gray,
            chalk.default.blackBright
        ];
        let hash = 0;
        for (let i = 0; i < moduleName.length; i++) {
            hash = moduleName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    }

    _formatMessage(level, message, ...args) {
        const coloredModuleName = this.moduleColor(`[${this.moduleName}]`);
        let formattedMessage = `${coloredModuleName} ${message}`;

        switch (level) {
            case 'INFO':
                return chalk.default.greenBright(formattedMessage, ...args);
            case 'WARN':
                return chalk.default.yellowBright(formattedMessage, ...args);
            case 'ERROR':
                return chalk.default.redBright(formattedMessage, ...args);
            case 'DEBUG':
                return chalk.default.blueBright(formattedMessage, ...args);
            default:
                return formattedMessage;
        }
    }

    info(message, ...args) {
        console.log(this._formatMessage('INFO', message, ...args));
    }

    warn(message, ...args) {
        console.warn(this._formatMessage('WARN', message, ...args));
    }

    error(message, ...args) {
        console.error(this._formatMessage('ERROR', message, ...args));
    }

    debug(message, ...args) {
        if (process.env.NODE_ENV === 'development') { // Only show debug logs in development
            console.log(this._formatMessage('DEBUG', message, ...args));
        }
    }
}

module.exports = Logger;
