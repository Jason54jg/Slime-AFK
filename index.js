const mineflayer = require("mineflayer");
const { randomizeTimer, Timers } = require("./src/utils/timerManager");
const { sendWebhookLog } = require("./src/utils/webhookLogger");
const { createLogger } = require("./src/utils/botLogger");
const { createMessageHandler } = require("./src/handlers/messageHandler");
const { createWindowHandler } = require("./src/handlers/windowHandler");
const { GameState } = require("./src/utils/gameState");
const config = require("./config.json");

const log = createLogger(config);
const gameState = new GameState();

const bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.account.username,
    version: "1.8.9",
    auth: "microsoft",
    plugins: {
        breath: false // Désactive le plugin breath
    }
});

bot.config = config;
bot.gameState = gameState;

// Gestionnaire de fenêtres
bot.on('windowOpen', createWindowHandler(bot, log));

bot.once("login", async () => {
    await log(`Le ${bot.username} a rejoint le serveur.`);
    await sendWebhookLog(`🟢 ${bot.username} s'est connecté au serveur`, 'success');

    // On commence par se connecter au skyblock
    setTimeout(() => {
        if (gameState.canExecuteCommand('/skyblock')) {
            bot.chat("/skyblock");
            gameState.updateLastCommand('/skyblock');
            log("Commande /skyblock envoyée");
        }
    }, randomizeTimer(Timers.SKYBLOCK));
});

const messageHandler = createMessageHandler(bot, log, config);
bot.on("message", async (message) => {
    const msg = message.toString().trim();

    // Détection de l'arrivée sur Skyblock
    if (msg.includes("Welcome to Hypixel SkyBlock!")) {
        gameState.setInSkyblock(true);
        await log("Connecté à Skyblock avec succès");

        // Maintenant qu'on est sur Skyblock, on peut faire le /visit
        setTimeout(() => {
            if (gameState.canExecuteCommand('/visit')) {
                bot.chat("/visit " + config.visit.username);
                gameState.updateLastCommand('/visit');
                log("Commande /visit envoyée");
            }
        }, randomizeTimer(Timers.VISIT_SHORT));
    }

    // Gestion standard des messages
    messageHandler(message);
});

// Gestion des erreurs
bot.on('error', async (error) => {
    await log(`Erreur du bot: ${error.message}`);
    await sendWebhookLog(`❌ Erreur: ${error.message}`, 'error');
});

bot.on('end', async () => {
    // Reconnexion automatique après 5 secondes
    setTimeout(() => {
        gameState.setInSkyblock(false);
        startBot();
    }, 5000);
});

process.on('unhandledRejection', async (error) => {
    await log(`Erreur non gérée: ${error.message}`);
    await sendWebhookLog(`❌ Erreur non gérée: ${error.message}`, 'error');
});

// Gestion de la déconnexion propre
process.on('SIGINT', async () => {
    await log("Arrêt du bot...");
    await sendWebhookLog("🔴 Arrêt du bot", "warning");
    if (bot.connected) {
        bot.quit();
    }
    process.exit(0);
});