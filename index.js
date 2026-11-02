const mineflayer = require('mineflayer');
const { createLogger } = require('./src/utils/botLogger');
const { createMessageHandler } = require('./src/handlers/messageHandler');
const { createWindowHandler } = require('./src/handlers/windowHandler');
const { ConnectionManager } = require('./src/utils/connectionManager');
const { Navigation } = require('./src/utils/navigation');
const path = require('node:path');
function loadConfig() {
    return require(process.env.SLIME_CONFIG_PATH ? path.resolve(process.env.SLIME_CONFIG_PATH) : './config.json');
}
function validateConfig(settings) {
    const port = Number(settings?.server?.port);
    if (!settings?.server?.ip || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Serveur ou port Minecraft invalide.');
    if (!settings?.account?.username || settings.account.username === 'email') throw new Error('Renseignez le compte Microsoft dans votre configuration locale.');
    if (settings?.visit?.enabled && !/^[a-zA-Z0-9_]{1,16}$/.test(settings.visit.username || '')) throw new Error('Pseudo de visite invalide.');
    if (!settings?.bot || !settings?.visit) throw new Error('Sections bot et visit requises dans la configuration.');
}

function startBot(settings = loadConfig(), createBot = mineflayer.createBot) {
    validateConfig(settings);
    const log = createLogger(settings);
    const manager = new ConnectionManager(settings);
    const onError = error => { void log(`Erreur du bot: ${error.message}`); };
    function connect() {
        const bot = createBot({ host: settings.server.ip, port: Number(settings.server.port),
            username: settings.account.username, version: '1.8.9', auth: 'microsoft',
            plugins: { breath: false }, connectTimeout: 30000 });
        manager.setCurrentBot(bot);
        bot.config = settings;
        bot.navigation = new Navigation(bot, settings, manager, log);
        const handle = fn => (...args) => { Promise.resolve().then(() => fn(...args)).catch(onError); };
        bot.on('windowOpen', handle(createWindowHandler(bot, log)));
        bot.on('message', handle(createMessageHandler(bot, log, settings, manager)));
        bot.on('error', onError);
        bot.once('login', handle(async () => {
            if (manager.stopped || manager.currentBot !== bot) return;
            manager.handleConnect();
            await log(`Le ${bot.username} a rejoint le serveur.`);
            bot.navigation.skyblock();
        }));
        bot.once('end', handle(async () => {
            bot.navigation.stop();
            if (manager.currentBot !== bot) return;
            await manager.handleDisconnect(log, connect);
        }));
        return bot;
    }
    try { connect(); }
    catch (error) { onError(error); void manager.handleDisconnect(log, connect); }
    return manager;
}
if (require.main === module) {
    let manager;
    try { manager = startBot(); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
    const stop = () => { manager?.stop(); };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
}
module.exports = { startBot };
