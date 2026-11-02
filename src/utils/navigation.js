const { getDelay } = require('./timerManager');

class Navigation {
    constructor(bot, config, manager, log, clock = Date.now) {
        Object.assign(this, { bot, config, manager, log, clock });
        this.timers = new Map();
        this.lastCommands = new Map();
        this.lastSent = -Infinity;
        this.stopped = false;
        this.visitAttempts = 0;
    }
    active() {
        return !this.stopped && this.manager.canPerformAction() && this.manager.currentBot === this.bot;
    }
    schedule(key, delay, action) {
        if (this.stopped || this.timers.has(key)) return;
        this.timers.set(key, setTimeout(() => {
            this.timers.delete(key);
            if (this.active()) Promise.resolve().then(action).catch(error => this.log(`Erreur navigation: ${error.message}`));
        }, delay));
    }
    send(command, onSent = () => {}) {
        if (!this.active()) return false;
        const now = this.clock();
        const cooldown = command === '/is' ? 3600000 : command.startsWith('/visit ') ? 10000 : 3000;
        if (now - (this.lastCommands.get(command) ?? -Infinity) < cooldown) return false;
        if (now - this.lastSent < 3000) {
            this.schedule(command, 3000 - (now - this.lastSent), () => this.send(command, onSent));
            return false;
        }
        this.bot.chat(command);
        this.lastSent = now;
        this.lastCommands.set(command, now);
        onSent();
        return true;
    }
    target() {
        if (this.config.visit.enabled) {
            if (this.visitAttempts >= 3) return;
            this.send('/visit ' + this.config.visit.username, () => this.visitAttempts++);
        } else this.send('/is');
    }
    queueTarget() {
        this.schedule('target', getDelay('VISIT_SHORT', this.config), () => this.target());
    }
    skyblock() {
        this.schedule('skyblock', getDelay('SKYBLOCK', this.config), () => {
            this.send('/skyblock', () => this.queueTarget());
        });
    }
    stop() {
        this.stopped = true;
        for (const timer of this.timers.values()) clearTimeout(timer);
        this.timers.clear();
    }
}
module.exports = { Navigation };
