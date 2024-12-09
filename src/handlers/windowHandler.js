const { randomizeTimer, Timers } = require('../utils/timerManager');
const { sendWebhookLog, emojis } = require('../utils/webhookLogger');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function isPlayerHead(item) {
    if (!item) return false;
    return item.name === 'skull' ||
           item.name === 'player_head' ||
           (item.displayName && item.displayName.includes("Head"));
}

async function tryClickWindow(bot, slot, retries = 0) {
    try {
        await bot.clickWindow(slot, 0, 0);
        return true;
    } catch (error) {
        if (retries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return tryClickWindow(bot, slot, retries + 1);
        }
        return false;
    }
}

function createWindowHandler(bot, log) {
    return async function handleWindow(window) {
        // Attendre que la fenêtre soit complètement chargée
        await new Promise(resolve => setTimeout(resolve, 500));

        const targetSlot = 11;
        const slot = window.slots[targetSlot];

        // Logger le contenu pour débogage
        const items = window.slots
            .map((slot, index) => slot ? { index, name: slot.name } : null)
            .filter(item => item !== null);

        await log("Analyse du menu...");
        await sendWebhookLog(
            `${emojis.menu} Analyse du menu`,
            'info',
            [{ name: '📦 Items', value: `${items.length} items trouvés` }]
        );

        // Vérifier si c'est une tête de joueur
        if (slot && isPlayerHead(slot)) {
            await log(`Tête trouvée dans le slot ${targetSlot}`);

            // Tentative de clic
            const clickSuccess = await tryClickWindow(bot, targetSlot);

            if (clickSuccess) {
                await sendWebhookLog(
                    `${emojis.success} Clic sur la tête réussi`,
                    'success'
                );
            } else {
                await sendWebhookLog(
                    `${emojis.error} Échec du clic`,
                    'error'
                );

                // Réessayer la visite
                setTimeout(() => {
                    bot.chat("/visit " + bot.config.visit.username);
                    log("Nouvelle tentative de visite");
                }, randomizeTimer(Timers.VISIT_SHORT));
            }
        } else {
            await log("Tête non trouvée, nouvelle tentative...");
            await sendWebhookLog(
                `${emojis.warning} Tête non trouvée`,
                'warning'
            );

            // Réessayer la visite
            setTimeout(() => {
                bot.chat("/visit " + bot.config.visit.username);
                log("Nouvelle tentative de visite");
            }, randomizeTimer(Timers.VISIT_SHORT));
        }
    };
}

module.exports = {
    createWindowHandler
};