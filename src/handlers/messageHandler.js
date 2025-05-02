const { randomizeTimer, Timers } = require('../utils/timerManager');
const { sendWebhookLog } = require('../utils/webhookLogger');

function createMessageHandler(bot, log, config, connectionManager) {
    return async function handleMessage(event) {
        if (!connectionManager.canPerformAction()) return;

        const message = event.toString().trim();

        if (config.bot.logAllMessages) {
            await log(message);
        }

        if (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) {
            await log("Détecté dans le lobby, envoi vers Skyblock...");
            setTimeout(() => {
                if (connectionManager.canPerformAction()) {
                    const command = config.bot.useIsCommand ? "/is" : "/skyblock";
                    bot.chat(command);
                    log(`Commande ${command} envoyée`);
                }
            }, randomizeTimer(Timers.SKYBLOCK));
            await sendWebhookLog('🔄 Redirection vers le lobby', 'info');
        }

        if (message.includes("You were spawned in Limbo.")) {
            await log("Spawn dans le Limbo, tentative de reconnexion...");
            await sendWebhookLog('✅ Spawn dans le Limbo réussi', 'success');
            setTimeout(() => {
                if (connectionManager.canPerformAction()) {
                    const command = config.bot.useIsCommand ? "/is" : "/skyblock";
                    bot.chat(command);
                    log(`Commande ${command} envoyée depuis le Limbo`);
                }
            }, randomizeTimer(Timers.RECONNECT_SHORT));
        }

        if (message.includes("An exception occurred in your connection") ||
            message.includes("Out of sync")) {
            await log(`Problème de connexion au serveur (${bot.username})`);
            await sendWebhookLog('⚠️ Problème de connexion détecté', 'warning');
        }

        if (message.includes("[Important] This server will restart soon: Scheduled Restart")) {
            await log(`[Important] Ce serveur va bientôt redémarrer: Redémarrage planifié (${bot.username})`);
            await sendWebhookLog('🔄 Redémarrage planifié du serveur', 'warning');
        }

        if (message.includes("Warping...") || message.includes("Sending to server")) {
            await log(`Téléportation en cours... (${bot.username})`);
            await sendWebhookLog('🔄 Téléportation en cours', 'info');
            setTimeout(() => {
                if (connectionManager.canPerformAction()) {
                    bot.chat("/visit " + config.visit.username);
                    log("Nouvelle tentative de visite après téléportation");
                }
            }, randomizeTimer(Timers.VISIT_SHORT));
        }

        if (message.includes("Warping you to your SkyBlock island...")) {
            await log(`Téléportation vers l'île SkyBlock (${bot.username})`);
            await sendWebhookLog('🏝️ Téléportation vers l\'île SkyBlock', 'info');
            setTimeout(() => {
                if (connectionManager.canPerformAction()) {
                    bot.chat("/visit " + config.visit.username);
                    log("Tentative de visite après arrivée sur l'île");
                }
            }, randomizeTimer(Timers.VISIT_SHORT));
        }
    };
}

module.exports = {
    createMessageHandler
};