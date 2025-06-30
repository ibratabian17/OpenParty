/**
 * A map of hardcoded ANSI escape codes for colors.
 * Using these codes, we can style terminal output without any external dependencies.
 */
const ANSI_COLORS = {
    RESET: '\x1b[0m',
    GREEN_BRIGHT: '\x1b[92m',
    YELLOW_BRIGHT: '\x1b[93m',
    RED_BRIGHT: '\x1b[91m',
    BLUE_BRIGHT: '\x1b[94m',
    CYAN_BRIGHT: '\x1b[96m',
    MAGENTA_BRIGHT: '\x1b[95m',
    WHITE_BRIGHT: '\x1b[97m',
    GRAY: '\x1b[90m',
};

class Logger {
    constructor(moduleName = 'APP') {
        this.moduleName = moduleName;
        // Store the raw color code for the module
        this.moduleColorCode = this._getModuleColorCode(moduleName);
    }

    /**
     * Hashes the module name to select a consistent color from a predefined list.
     * @param {string} moduleName - The name of the module.
     * @returns {string} The ANSI color code for the module.
     */
    _getModuleColorCode(moduleName) {
        const colors = [
            ANSI_COLORS.CYAN_BRIGHT,
            ANSI_COLORS.MAGENTA_BRIGHT,
            ANSI_COLORS.YELLOW_BRIGHT,
            ANSI_COLORS.BLUE_BRIGHT,
            ANSI_COLORS.GREEN_BRIGHT,
            ANSI_COLORS.RED_BRIGHT,
            ANSI_COLORS.WHITE_BRIGHT,
            ANSI_COLORS.GRAY,
        ];
        let hash = 0;
        if (moduleName.length === 0) return colors[0];
        for (let i = 0; i < moduleName.length; i++) {
            hash = moduleName.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Convert to 32bit integer
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    }

    /**
     * Formats the log message with module and level-specific colors.
     * @param {string} level - The log level (e.g., 'INFO', 'WARN').
     * @param {string} message - The main log message.
     * @param {...any} args - Additional arguments to be logged.
     * @returns {string} The fully formatted and colored log string.
     */
    _formatMessage(level, message, ...args) {
        const coloredModuleName = `${this.moduleColorCode}[${this.moduleName}]${ANSI_COLORS.RESET}`;

        // Join the main message and any additional arguments
        const fullMessageContent = [message, ...args].join(' ');

        let levelColorCode;
        switch (level) {
            case 'INFO':
                levelColorCode = ANSI_COLORS.GREEN_BRIGHT;
                break;
            case 'WARN':
                levelColorCode = ANSI_COLORS.YELLOW_BRIGHT;
                break;
            case 'ERROR':
                levelColorCode = ANSI_COLORS.RED_BRIGHT;
                break;
            case 'DEBUG':
                levelColorCode = ANSI_COLORS.BLUE_BRIGHT;
                break;
            default:
                // For unknown levels, don't color the message part
                return `${coloredModuleName} ${fullMessageContent}`;
        }
        
        const coloredMessage = `${levelColorCode}${fullMessageContent}${ANSI_COLORS.RESET}`;
        return `${coloredModuleName} ${coloredMessage}`;
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
        // Only show debug logs in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log(this._formatMessage('DEBUG', message, ...args));
        }
    }
}

module.exports = Logger;
