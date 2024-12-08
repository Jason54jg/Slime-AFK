const { randomizeTimer, Timers } = require('../utils/timerManager');
const { sendWebhookLog } = require('../utils/webhookLogger');

function createMessageHandler(bot, log, config) {
  return async function handleMessage(event) {
    const message = event.toString().trim();

    // Always log the message first if logAllMessages is enabled
    if (config.bot.logAllMessages) {
      await log(message);
    }

    // Server status messages
    if (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) {
      await log("Détecté dans le lobby, envoi vers Skyblock...");
      setTimeout(() => {
        bot.chat("/skyblock");
        log("Commande /skyblock envoyée");
      }, randomizeTimer(Timers.SKYBLOCK));
      await sendWebhookLog('🔄 Redirection vers le lobby', 'info');
    }

    if (message.includes("You were spawned in Limbo.")) {
      await log("Spawn dans le Limbo, tentative de reconnexion...");
      await sendWebhookLog('✅ Spawn dans le Limbo réussi', 'success');
      setTimeout(() => {
        bot.chat("/skyblock");
        log("Commande /skyblock envoyée depuis le Limbo");
      }, randomizeTimer(Timers.RECONNECT_SHORT));
    }

    // Connection issues
    if (message.includes("An exception occurred in your connection") || message.includes("Out of sync")) {
      await log(`Problème de connexion au serveur (${bot.username})`);
      await sendWebhookLog('⚠️ Problème de connexion détecté', 'warning');
      setTimeout(() => {
        bot.chat("/skyblock");
        log("Tentative de reconnexion - /skyblock");
      }, randomizeTimer(Timers.RECONNECT_LONG));
      setTimeout(() => {
        bot.chat("/visit " + config.visit.username);
        log("Tentative de visite après reconnexion");
      }, randomizeTimer(Timers.VISIT_LONG));
    }

    // Server restart messages
    if (message.includes("[Important] This server will restart soon: Scheduled Restart")) {
      await log(`[Important] Ce serveur va bientôt redémarrer: Redémarrage planifié (${bot.username})`);
      await sendWebhookLog('🔄 Redémarrage planifié du serveur', 'warning');
      setTimeout(() => {
        bot.chat("/skyblock");
        log("Préparation au redémarrage - /skyblock");
      }, randomizeTimer(Timers.RECONNECT_LONG));
      setTimeout(() => {
        bot.chat("/visit " + config.visit.username);
        log("Préparation au redémarrage - /visit");
      }, randomizeTimer(Timers.VISIT_LONG));
    }

    // Teleportation messages
    if (message.includes("Warping...") || message.includes("Sending to server")) {
      await log(`Téléportation en cours... (${bot.username})`);
      await sendWebhookLog('🔄 Téléportation en cours', 'info');
      setTimeout(() => {
        bot.chat("/visit " + config.visit.username);
        log("Nouvelle tentative de visite après téléportation");
      }, randomizeTimer(Timers.VISIT_SHORT));
    }

    if (message.includes("Warping you to your SkyBlock island...")) {
      await log(`Téléportation vers l'île SkyBlock (${bot.username})`);
      await sendWebhookLog('🏝️ Téléportation vers l\'île SkyBlock', 'info');
      setTimeout(() => {
        bot.chat("/visit " + config.visit.username);
        log("Tentative de visite après arrivée sur l'île");
      }, randomizeTimer(Timers.VISIT_SHORT));
    }
  };
}

module.exports = {
  createMessageHandler
};