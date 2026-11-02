const { randomizeTimer: baseRandomize } = require('./randomizer');
const Timers = { SKYBLOCK: 6000, RECONNECT_SHORT: 5000, RECONNECT_MEDIUM: 15000,
    RECONNECT_LONG: 30000, VISIT_SHORT: 3000, VISIT_MEDIUM: 10000, VISIT_LONG: 20000,
    WINDOW_CLICK: 1200, WINDOW_ANALYZE: 800, RETRY_DELAY: 2000, MESSAGE_CHECK: 500 };
const keys = { WINDOW_CLICK: 'clickDelay', WINDOW_ANALYZE: 'windowAnalyze', RETRY_DELAY: 'retryDelay', MESSAGE_CHECK: 'messageCheck' };
function randomizeTimer(baseTime, config) {
    if (!config?.cooldowns?.randomization?.enabled) return baseTime;
    const variance = config.cooldowns.randomization.variance ?? 0.2;
    return baseRandomize(baseTime, Number.isFinite(variance) ? Math.min(1, Math.max(0, variance)) : 0.2);
}
function getConfiguredDelay(type, config) {
    const delay = config?.cooldowns?.enabled ? config.cooldowns.delays?.[keys[type] || type.toLowerCase()] : undefined;
    return Number.isFinite(delay) && delay >= 0 ? delay : Timers[type];
}
function getDelay(type, config) { return randomizeTimer(getConfiguredDelay(type, config), config); }
module.exports = { Timers, randomizeTimer, getConfiguredDelay, getDelay };
