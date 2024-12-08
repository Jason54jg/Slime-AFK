const { randomizeTimer: baseRandomize } = require('./randomizer');

const Timers = {
    SKYBLOCK: 6000,
    RECONNECT_SHORT: 5000,
    RECONNECT_MEDIUM: 15000,
    RECONNECT_LONG: 30000,
    VISIT_SHORT: 2000,
    VISIT_MEDIUM: 10000,
    VISIT_LONG: 20000,
    WINDOW_CLICK: 1200,
    WINDOW_ANALYZE: 800
};

function randomizeTimer(baseTime, config) {
    if (!config?.cooldowns?.randomization?.enabled) {
        return baseTime;
    }

    const variance = config.cooldowns.randomization.variance || 0.2;
    return baseRandomize(baseTime, variance);
}

function getConfiguredDelay(type, config) {
    if (!config?.cooldowns?.enabled) {
        return Timers[type];
    }

    const configDelay = config.cooldowns.delays[type.toLowerCase()];
    return configDelay || Timers[type];
}

module.exports = {
    Timers,
    randomizeTimer,
    getConfiguredDelay
};