function createMessageHandler(bot, log, config, connectionManager) {
    return async event => {
        if (!bot.navigation.active()) return;
        const message = event.toString().trim();
        if (config.bot.logAllMessages) await log(message);
        if (message.endsWith(' the lobby!') || message.includes(' the lobby! <<<') || message.includes('You were spawned in Limbo.')) {
            bot.navigation.skyblock();
        }
        if (message.includes('Warping...') || message.includes('Sending to server') ||
            message.includes('Warping you to your SkyBlock island...') || /Welcome to Hypixel SkyBlock!/i.test(message)) {
            bot.navigation.queueTarget();
        }
        if (message.includes('[Important] This server will restart soon: Scheduled Restart')) {
            await log(`Redémarrage planifié du serveur (${bot.username}).`);
        }
        if (message.includes('An exception occurred in your connection') || message.includes('Out of sync')) {
            await log(`Problème de connexion (${bot.username}): ${message}`);
        }
    };
}
module.exports = { createMessageHandler };
