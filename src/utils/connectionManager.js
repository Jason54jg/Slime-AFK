const { sendWebhookLog } = require('./webhookLogger');
const { ConnectionLock } = require('./connectionLock');

class ConnectionManager {
    constructor(config) {
        this.isConnected = false;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.RECONNECT_DELAY = 5000;
        this.config = config;
        this.lock = new ConnectionLock();
        this.currentBot = null;
    }

    setCurrentBot(bot) {
        this.currentBot = bot;
    }

    async handleConnect() {
        this.isConnected = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        return true;
    }

    async handleDisconnect(log, createBot) {
        if (this.isReconnecting) return;

        this.isConnected = false;
        this.isReconnecting = true;

        this.reconnectAttempts++;

        await log(`Tentative de reconnexion #${this.reconnectAttempts} dans ${this.RECONNECT_DELAY/1000} secondes...`);
        await sendWebhookLog(`🔄 Tentative de reconnexion #${this.reconnectAttempts}`, "warning");

        setTimeout(async () => {
            try {
                if (this.currentBot) {
                    this.currentBot.removeAllListeners();
                }
                this.isReconnecting = false;
                await createBot();
            } catch (error) {
                this.isReconnecting = false;
                await log(`Erreur lors de la tentative de reconnexion: ${error.message}`);
                // Réessayer immédiatement en cas d'échec
                this.handleDisconnect(log, createBot);
            }
        }, this.RECONNECT_DELAY);
    }

    canPerformAction() {
        return this.isConnected && !this.isReconnecting;
    }
}

module.exports = { ConnectionManager };