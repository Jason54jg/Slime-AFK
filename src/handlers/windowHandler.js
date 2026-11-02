const { getDelay } = require('../utils/timerManager');
function plain(value) {
    return (typeof value === 'string' ? value : JSON.stringify(value) || '').replace(/§[0-9a-fk-or]/gi, '').toLowerCase();
}
function findTargetSlot(window, config) {
    const title = plain(window.title);
    if (!/visit|visiter/.test(title)) return -1;
    const username = config.visit.username.toLowerCase();
    const containsName = text => text.split(/[^a-z0-9_]+/).includes(username);
    const limit = window.inventoryStart ?? Math.min(27, window.slots.length);
    return window.slots.findIndex((item, index) => index < limit && item &&
        ['skull', 'player_head'].includes(item.name) &&
        (containsName(plain(item.customName) + ' ' + plain(item.nbt) + ' ' + plain(item.displayName)) ||
         (index === 11 && containsName(title))));
}
function createWindowHandler(bot, log) {
    return async window => {
        const nav = bot.navigation;
        if (!bot.config.visit.enabled || !nav.active()) return;
        const slot = findTargetSlot(window, bot.config);
        if (slot < 0) return;
        nav.schedule('window', getDelay('WINDOW_ANALYZE', bot.config), async () => {
            for (let attempt = 0; attempt < 3; attempt++) {
                if (!nav.active() || bot.currentWindow !== window || findTargetSlot(window, bot.config) !== slot) return;
                try {
                    await bot.clickWindow(slot, 0, 0);
                    await log('Clic sur la tête du joueur demandé réussi.');
                    return;
                } catch (error) {
                    if (attempt === 2) { await log(`Échec du clic après 3 tentatives: ${error.message}`); return; }
                    await new Promise(resolve => setTimeout(resolve, getDelay('RETRY_DELAY', bot.config)));
                }
            }
        });
    };
}
module.exports = { createWindowHandler, findTargetSlot };
