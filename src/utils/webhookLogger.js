const { Webhook, MessageBuilder } = require('discord-webhook-node');
const config = require('../../config.json');

let webhook;

if (config.webhook?.url) {
  webhook = new Webhook(config.webhook.url);
  webhook.setUsername(config.webhook.username || 'Slime Bot Logger');
  webhook.setAvatar(config.webhook.avatar || 'https://i.imgur.com/oBPXx0D.png');
}

const colors = {
  info: 3447003,     // Bleu royal
  warning: 16750848, // Orange
  error: 15158332,   // Rouge vif
  success: 5763719   // Vert émeraude
};

const emojis = {
  info: '📝',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  bot: '🤖',
  server: '🖥️',
  teleport: '🌀',
  visit: '🏃',
  menu: '📋'
};

async function sendWebhookLog(content, type = 'info', fields = []) {
  if (!webhook) return;

  try {
    const embed = new MessageBuilder()
      .setTitle(`${emojis[type] || emojis.info} Slime Bot`)
      .setDescription(content)
      .setColor(colors[type] || colors.info)
      .setTimestamp();

    // Ajouter des champs supplémentaires si fournis
    fields.forEach(field => {
      embed.addField(field.name, field.value, field.inline || false);
    });

    // Ajouter le footer
    embed.setFooter(`Bot: ${config.account.username}`, config.webhook.avatar);

    await webhook.send(embed);
  } catch (error) {
    console.error('Failed to send webhook:', error);
  }
}

module.exports = {
  sendWebhookLog,
  emojis
};