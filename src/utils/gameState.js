class GameState {
    constructor() {
        this.isInSkyblock = false;
        this.isInLobby = false;
        this.isInLimbo = false;
        this.lastCommand = null;
        this.lastCommandTime = null;
    }

    setInSkyblock(value) {
        this.isInSkyblock = value;
        if (value) {
            this.isInLobby = false;
            this.isInLimbo = false;
        }
    }

    setInLobby(value) {
        this.isInLobby = value;
        if (value) {
            this.isInSkyblock = false;
            this.isInLimbo = false;
        }
    }

    setInLimbo(value) {
        this.isInLimbo = value;
        if (value) {
            this.isInSkyblock = false;
            this.isInLobby = false;
        }
    }

    updateLastCommand(command) {
        this.lastCommand = command;
        this.lastCommandTime = Date.now();
    }

    canExecuteCommand(command) {
        if (!this.lastCommandTime) return true;

        const timeSinceLastCommand = Date.now() - this.lastCommandTime;
        return timeSinceLastCommand >= 3000; // Minimum 3 seconds between commands
    }
}

module.exports = { GameState };