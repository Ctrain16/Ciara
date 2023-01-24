const Commando = require('discord.js-commando');

module.exports = class ToggleProtectChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'toggleprotectchannel',
      aliases: ['tpg'],
      group: 'util',
      memberName: 'toggleprotectchannel',
      description: 'When enabled this protects specified channels from meme.',
      examples: ['toggleProtectChannel (enable|disable)'],

      args: [
        {
          key: 'toggle',
          prompt: 'Would you like to enable or disable channel protection?',
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { toggle }) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('ADMINISTRATOR'))
      return msg.reply(`You don't have permission to use this command.`);

    const guildSettings = this.client.provider.settings.get(msg.guild.id);
    if (['enable', 'e'].includes(toggle.toLowerCase())) {
      if (guildSettings.protectChannels) {
        return msg.reply(`Channel protection is already enabled.`);
      } else {
        await this.client.provider.set(msg.guild.id, 'protectChannels', true);
        return msg.reply(`Channel protection now enabled.`);
      }
    } else if (['disable', 'd'].includes(toggle.toLowerCase())) {
      if (guildSettings.protectChannels) {
        this.client.provider.set(msg.guild.id, 'protectChannels', false);
        return msg.reply(`Channel protection is now disabled.`);
      } else {
        return msg.reply(`Channel protection is already disabled.`);
      }
    } else {
      return msg.reply(
        `${toggle} is an invalid state. Valid states include 'enable' and 'disable'`
      );
    }
  }
};
