const mineflayer = require("mineflayer");
const { randomizeTimer, Timers } = require("./src/utils/timerManager");
const { sendWebhookLog } = require("./src/utils/webhookLogger");
const { createLogger } = require("./src/utils/botLogger");
const { createMessageHandler } = require("./src/handlers/messageHandler");
const { createWindowHandler } = require("./src/handlers/windowHandler");
const { GameState } = require("./src/utils/gameState");
const { ConnectionManager } = require("./src/utils/connectionManager");
const config = require("./config.json");

const log = createLogger(config);
const gameState = new GameState();
const connectionManager = new ConnectionManager(config);

function setupBot(bot) {
    connectionManager.setCurrentBot(bot);

    bot.on('windowOpen', createWindowHandler(bot, log));

    bot.once("login", async () => {
        await connectionManager.handleConnect();
        await log(`Le ${bot.username} a rejoint le serveur.`);
        await sendWebhookLog(`🟢 ${bot.username} s'est connecté au serveur`, 'success');

        setTimeout(() => {
            if (gameState.canExecuteCommand('/skyblock') && connectionManager.canPerformAction()) {
                bot.chat("/skyblock");
                gameState.updateLastCommand('/skyblock');
                log("Commande /skyblock envoyée");
            }
        }, randomizeTimer(Timers.SKYBLOCK));
    });

    const messageHandler = createMessageHandler(bot, log, config, connectionManager);
    bot.on("message", messageHandler);

    bot.on('error', async (error) => {
        await log(`Erreur du bot: ${error.message}`);
        await sendWebhookLog(`❌ Erreur: ${error.message}`, 'error');
    });

    bot.on('end', async () => {
        await log("Déconnecté du serveur.");
        gameState.setInSkyblock(false);
        await connectionManager.handleDisconnect(log, createBotConnection);
    });

    return bot;
}

function createBotConnection() {
    const bot = mineflayer.createBot({
        host: config.server.ip,
        port: config.server.port,
        username: config.account.username,
        version: "1.8.9",
        auth: "microsoft",
        plugins: {
            breath: false
        },
        connectTimeout: 30000
    });

    bot.config = config;
    bot.gameState = gameState;

    return setupBot(bot);
}

let bot = createBotConnection();

process.on('unhandledRejection', async (error) => {
    await log(`Erreur non gérée: ${error.message}`);
    await sendWebhookLog(`❌ Erreur non gérée: ${error.message}`, 'error');
});

process.on('SIGINT', async () => {
    await log("Arrêt du bot...");
    await sendWebhookLog("🔴 Arrêt du bot", "warning");
    if (bot.connected) {
        bot.quit();
    }
    process.exit(0);
});