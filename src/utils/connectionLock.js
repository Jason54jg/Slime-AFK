class ConnectionLock {
    constructor() {
        this.locked = false;
        this.lockTimeout = null;
    }

    acquire() {
        if (this.locked) {
            return false;
        }
        this.locked = true;
        this.resetTimeout();
        return true;
    }

    release() {
        this.locked = false;
        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout);
            this.lockTimeout = null;
        }
    }

    resetTimeout() {
        if (this.lockTimeout) {
            clearTimeout(this.lockTimeout);
        }
        this.lockTimeout = setTimeout(() => {
            this.release();
        }, 30000); // Libère automatiquement après 30 secondes
    }
}

module.exports = { ConnectionLock };