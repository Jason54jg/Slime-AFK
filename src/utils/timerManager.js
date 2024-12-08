const Timers = {
    SKYBLOCK: 3000,
    RECONNECT_SHORT: 10000,
    RECONNECT_MEDIUM: 40000,
    RECONNECT_LONG: 70000,
    VISIT_SHORT: 5000,
    VISIT_MEDIUM: 42000,
    VISIT_LONG: 80000,
    WINDOW_CLICK: 2000,
    WINDOW_ANALYZE: 500
};

function randomizeTimer(baseTime, variance = 0.2) {
    const variation = baseTime * variance;
    const randomOffset = Math.random() * variation * 2 - variation;
    return Math.max(1000, Math.floor(baseTime + randomOffset));
}

module.exports = {
    Timers,
    randomizeTimer
};