function randomizeTimer(baseTime, variance = 0.2) {
    const variation = baseTime * variance;
    const randomOffset = Math.random() * variation * 2 - variation;
    return Math.max(500, Math.floor(baseTime + randomOffset));
}

module.exports = {
    randomizeTimer
};