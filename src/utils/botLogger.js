const { createWebhookLogger } = require('./webhookLogger');
const { formatTimestamp } = require('./timeFormatter');
function createLogger(config) {
    const sendWebhookLog = createWebhookLogger(config);
    return async function log(...args) {
        const timestamp = config.bot.logTime ? formatTimestamp() : '';
        const message = args.join('').replace(/\u001b\[[0-9;]*m/g, '');
        console.log(`${timestamp}${message}`);
        // Optional Discord logging must not delay connection lifecycle handling.
        void sendWebhookLog(message);
    };
}
module.exports = { createLogger };
