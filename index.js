const mineflayer = require("mineflayer");
const log = (...args) => require("process").stdout.write((config.bot.logTime ? `<${new Date(Date.now()).toLocaleTimeString()}> ` : "") + args.join("") + "[0m\n");
const config = require("./config.json");

const bot = mineflayer.createBot({
    host: config.server.ip,
    port: config.server.port,
    username: config.account.username,
    version: "1.8.9",
    auth: "microsoft",
})

bot.on('windowOpen', (window) => {
    setTimeout(() => {
        const playerHeads = window.slots
            .filter(slot => slot !== null && slot.name === 'minecraft:player_head')
        if (playerHeads.length > 0) {
            const mouseButton = 0; // 0: left click, 1: right click
            const mode = 0; // 0: single click
            bot.clickWindow(playerHeads[0].slot, mouseButton, mode);
        }
        else{
            console.log("pas de player head trouvé, voici la liste des items")
            window.slots.forEach((slot, index) => {
                if (slot) {
                    console.log(`Case ${index}: ${slot.displayName}`);
                } else {
                    console.log(`Case ${index}: Vide`);
                }
            });
        }
    }, 5000); 
    });

const limbo = () => {
    Array.from(Array(1)).forEach(() => setTimeout(() => bot.chat("/skyblock"), 3000));
}

bot.once("login", () => log(`Le ${bot.username} a rejoint le serveur.`))

bot.on("message", event => {
    let message = event.toString().trim();
    if (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) limbo();
    if (message.includes("You were spawned in Limbo.")) log("[32mSuccessfully spawned in Limbo.");
    if (message.includes("An exception occurred in your connection, so you were put in the SkyBlock Lobby!") || message.includes("Out of sync, check your internet connection!")) {
    log(`Problème de connexion au serveur (${bot.username})`);
        setTimeout(() => bot.chat("/skyblock"), 70000);
        setTimeout(() => bot.chat("/visit " + config.visit.username), 80000);
    }
    if (message.includes("[Important] This server will restart soon: Scheduled Restart")) {
    log(`[Important] Ce serveur va bientôt redémarrer: Redémarrage planifié (${bot.username})`);
        setTimeout(() => bot.chat("/skyblock"), 70000);
        setTimeout(() => bot.chat("/visit " + config.visit.username), 80000);
    }
    if (message.includes("This server will restart soon: Game Update")) {
    log(`Ce serveur va bientôt redémarrer: mise à jour du jeu (${bot.username})`);
        setTimeout(() => bot.chat("/skyblock"), 40000);
        setTimeout(() => bot.chat("/visit " + config.visit.username), 42000);
    }
    if (message.includes("Evacuating to Hub...")) {
    log(`Évacuation vers le hub (${bot.username})`);
        setTimeout(() => bot.chat("/visit " + config.visit.username), 10000);
    }
    if (message.includes("Sending to server")) {
    log(`Envoi au serveur (${bot.username})`);
        setTimeout(() => bot.chat("/visit " + config.visit.username), 10000);
    }
    if (message.includes("Warping you to your SkyBlock island...")) {
    log(`Vous téléporte sur votre île SkyBlock (${bot.username})`);
    }
    if (config.bot.logAllMessages) log(message);
});
