const { sendWebhookLog } = require('./webhookLogger');
const { formatTimestamp } = require('./timeFormatter');

function createLogger(config) {
  return async function log(...args) {
    const timestamp = config.bot.logTime ? formatTimestamp() : '';
    const message = args.join('').replace(/\[\d+m/g, '');

    // Console output - Always log to console
    console.log(`${timestamp}${message}`);

    // Discord webhook - Only if configured
    if (config.webhook?.url) {
      try {
        await sendWebhookLog(message);
      } catch (error) {
        console.error('Webhook error:', error);
      }
    }
  };
}

module.exports = {
  createLogger
};