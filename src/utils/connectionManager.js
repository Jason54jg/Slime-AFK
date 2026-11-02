class ConnectionManager {
    constructor(config) {
        this.config = config;
        this.isConnected = false;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.currentBot = null;
        this.stopped = false;
        this.timer = null;
    }
    setCurrentBot(bot) { this.currentBot = bot; }
    handleConnect() {
        if (this.stopped) return;
        this.isConnected = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
    }
    async handleDisconnect(log, createBot) {
        this.isConnected = false;
        if (this.stopped || this.isReconnecting) return;
        this.isReconnecting = true;
        const delay = Math.min(60000, 5000 * 2 ** Math.min(this.reconnectAttempts++, 4));
        this.timer = setTimeout(async () => {
            this.timer = null;
            if (this.stopped) return;
            this.isReconnecting = false;
            try { await createBot(); }
            catch (error) {
                void log(`Erreur de reconnexion: ${error.message}`);
                void this.handleDisconnect(log, createBot);
            }
        }, delay);
        await log(`Tentative de reconnexion #${this.reconnectAttempts} dans ${delay / 1000} secondes...`);
    }
    canPerformAction() { return !this.stopped && this.isConnected && !this.isReconnecting; }
    stop() {
        this.stopped = true;
        this.isConnected = false;
        clearTimeout(this.timer);
        this.currentBot?.navigation?.stop();
        const bot = this.currentBot;
        if (bot) (bot.quit || bot.end)?.call(bot);
    }
}
module.exports = { ConnectionManager };
