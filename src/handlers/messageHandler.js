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
                    bot.chat("/skyblock");
                    log("Commande /skyblock envoyée");
                }
            }, randomizeTimer(Timers.SKYBLOCK));
            await sendWebhookLog('🔄 Redirection vers le lobby', 'info');
        }

        if (message.includes("You were spawned in Limbo.")) {
            await log("Spawn dans le Limbo, tentative de reconnexion...");
            await sendWebhookLog('✅ Spawn dans le Limbo réussi', 'success');
            setTimeout(() => {
                if (connectionManager.canPerformAction()) {
                    bot.chat("/skyblock");
                    log("Commande /skyblock envoyée depuis le Limbo");
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
                    if (config.visit.enabled) {
                        bot.chat("/visit " + config.visit.username);
                        log("Tentative de visite d'une île");
                    } else {
                        bot.chat("/is");
                        log("Téléportation vers sa propre île");
                    }
                }
            }, randomizeTimer(Timers.VISIT_SHORT));
        }

        if (message.includes("Warping you to your SkyBlock island...")) {
            await log(`Téléportation vers l'île SkyBlock (${bot.username})`);
            await sendWebhookLog('🏝️ Téléportation vers l\'île SkyBlock', 'info');
            setTimeout(() => {
                if (connectionManager.canPerformAction()) {
                    if (config.visit.enabled) {
                        bot.chat("/visit " + config.visit.username);
                        log("Tentative de visite d'une île");
                    } else {
                        bot.chat("/is");
                        log("Téléportation vers sa propre île");
                    }
                }
            }, randomizeTimer(Timers.VISIT_SHORT));
        }

        if (message.includes("You are already on your island!")) {
            await log("Déjà sur l'île, pas besoin de se téléporter");
            await sendWebhookLog('🏝️ Déjà sur l\'île', 'info');
        }

        if (message.includes("You are already visiting that player!")) {
            await log("Déjà en train de visiter cette île");
            await sendWebhookLog('🏃 Déjà en train de visiter', 'info');
        }
    };
}

module.exports = {
    createMessageHandler
};