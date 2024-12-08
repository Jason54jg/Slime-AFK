const mineflayer = require("mineflayer");
const { randomizeTimer, Timers } = require("./src/utils/timerManager");
const { sendWebhookLog } = require("./src/utils/webhookLogger");
const { createLogger } = require("./src/utils/botLogger");
const { createMessageHandler } = require("./src/handlers/messageHandler");
const { createWindowHandler } = require("./src/handlers/windowHandler");
const config = require("./config.json");

const log = createLogger(config);

const bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.account.username,
    version: "1.8.9",
    auth: "microsoft",
});

// Ajouter la config au bot pour qu'elle soit accessible dans les handlers
bot.config = config;

// Utiliser le nouveau gestionnaire de fenêtres
bot.on('windowOpen', createWindowHandler(bot, log));

bot.once("login", async () => {
    await log(`Le ${bot.username} a rejoint le serveur.`);
    await sendWebhookLog(`🟢 ${bot.username} s'est connecté au serveur`, 'success');

    // Initial commands after login
    setTimeout(() => {
        bot.chat("/skyblock");
        log("Commande /skyblock envoyée");
    }, randomizeTimer(Timers.SKYBLOCK));

    setTimeout(() => {
        bot.chat("/visit " + config.visit.username);
        log("Commande /visit envoyée");
    }, randomizeTimer(Timers.VISIT_SHORT));
});

const messageHandler = createMessageHandler(bot, log, config);
bot.on("message", messageHandler);

// Gestion des erreurs
bot.on('error', async (error) => {
    await log(`Erreur du bot: ${error.message}`);
    await sendWebhookLog(`❌ Erreur: ${error.message}`, 'error');
});

process.on('unhandledRejection', async (error) => {
    await log(`Erreur non gérée: ${error.message}`);
    await sendWebhookLog(`❌ Erreur non gérée: ${error.message}`, 'error');
});