const { randomizeTimer, Timers } = require('../utils/timerManager');
const { sendWebhookLog, emojis } = require('../utils/webhookLogger');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function isPlayerHead(item) {
    if (!item) return false;
    return item.name === 'minecraft:player_head' ||
           item.name === 'minecraft:skull' ||
           (item.displayName && item.displayName.includes("Head"));
}

async function tryClickWindow(bot, windowId, slot, mouseButton, mode, retries = 0) {
    try {
        await bot.clickWindow(slot, mouseButton, mode);
        return true;
    } catch (error) {
        if (retries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return tryClickWindow(bot, windowId, slot, mouseButton, mode, retries + 1);
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

        // Logger tous les items pour le débogage
        const items = window.slots
            .map((slot, index) => slot ? { index, name: slot.name, display: slot.displayName } : null)
            .filter(item => item !== null);

        await log("Contenu de la fenêtre:");
        await sendWebhookLog(
            `${emojis.menu} Analyse du menu`,
            'info',
            [
                { name: '📦 Items trouvés', value: `${items.length} items`, inline: true },
                { name: '🎯 Slot cible', value: `${targetSlot}`, inline: true }
            ]
        );

        // Préparer les informations sur l'item
        const itemInfo = slot ? {
            name: slot.name || 'Vide',
            displayName: slot.displayName || 'Aucun nom',
            slot: targetSlot,
            type: slot.type || 'Inconnu'
        } : {
            name: 'Vide',
            displayName: 'Slot vide',
            slot: targetSlot,
            type: 'Aucun'
        };

        // Vérifier si c'est une tête de joueur
        if (slot && isPlayerHead(slot)) {
            await log(`Tête de joueur trouvée dans le slot ${targetSlot}`);

            // Essayer de cliquer avec système de retry
            const clickSuccess = await tryClickWindow(bot, window.id, targetSlot, 0, 0);

            if (clickSuccess) {
                await sendWebhookLog(
                    `${emojis.success} Clic sur la tête réussi`,
                    'success',
                    [
                        { name: '📍 Slot', value: `${targetSlot}`, inline: true },
                        { name: '🏷️ Item', value: itemInfo.displayName, inline: true }
                    ]
                );
            } else {
                await sendWebhookLog(
                    `${emojis.error} Échec du clic après plusieurs tentatives`,
                    'error',
                    [
                        { name: '📍 Slot', value: `${targetSlot}`, inline: true },
                        { name: '🔄 Action', value: 'Nouvelle tentative de visite', inline: true }
                    ]
                );

                // Si le clic échoue, réessayer la commande /visit
                setTimeout(() => {
                    bot.chat("/visit " + bot.config.visit.username);
                    log("Nouvelle tentative de visite après échec du clic");
                }, randomizeTimer(Timers.VISIT_SHORT));
            }
        } else {
            await log(`Aucune tête trouvée dans le slot ${targetSlot}`);
            await sendWebhookLog(
                `${emojis.warning} Tête non trouvée`,
                'warning',
                [
                    { name: '📍 Slot actuel', value: `${targetSlot}`, inline: true },
                    { name: '🏷️ Item trouvé', value: itemInfo.displayName, inline: true },
                    { name: '📝 Action', value: 'Nouvelle tentative de visite', inline: false }
                ]
            );

            // Réessayer la commande /visit
            setTimeout(() => {
                bot.chat("/visit " + bot.config.visit.username);
                log("Nouvelle tentative de visite - tête non trouvée");
            }, randomizeTimer(Timers.VISIT_SHORT));
        }
    };
}

module.exports = {
    createWindowHandler
};