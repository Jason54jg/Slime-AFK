const colors = { info: 3447003, warning: 16750848, error: 15158332, success: 5763719 };
const emojis = { info: '📝', warning: '⚠️', error: '❌', success: '✅', bot: '🤖', server: '🖥️', teleport: '🌀', visit: '🏃', menu: '📋' };

function createWebhookLogger(config, request = fetch) {
    return async function sendWebhookLog(content, type = 'info', fields = []) {
        if (!config.webhook?.url) return;
        const embed = {
            title: `${emojis[type] || emojis.info} Slime Bot`,
            description: String(content).slice(0, 4096),
            color: colors[type] || colors.info,
            timestamp: new Date().toISOString(),
            footer: { text: `Bot: ${config.account.username}` },
            fields: fields.slice(0, 25).map(field => ({ name: String(field.name).slice(0, 256),
                value: String(field.value).slice(0, 1024), inline: Boolean(field.inline) }))
        };
        try {
            const response = await request(config.webhook.url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000),
                body: JSON.stringify({ username: config.webhook.username || 'Slime Bot Logger',
                    avatar_url: config.webhook.avatar || undefined, embeds: [embed] })
            });
            if (!response.ok) console.error(`Webhook Discord: HTTP ${response.status}`);
            await response.body?.cancel();
        } catch {
            // A webhook URL contains credentials; do not print request errors or the URL.
            console.error('Webhook Discord indisponible ou délai dépassé.');
        }
    };
}
module.exports = { createWebhookLogger, emojis };
