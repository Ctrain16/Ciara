const Commando = require('discord.js-commando');

module.exports = class ToggleLevelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'togglelevel',
      aliases: ['tl', 'toggle level'],
      group: 'serverxp',
      memberName: 'togglelevel',
      description: 'Enable or disable server levels.',
      examples: ['togglelevel (enable|disable)'],

      args: [
        {
          key: 'toggle',
          prompt: 'Would you like to enable or disable server levels?',
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { toggle }) {
    const guildSettings = this.client.provider.settings.get(msg.guild.id);
    if (['enable', 'e'].includes(toggle.toLowerCase())) {
      if (guildSettings.levelsEnabled) {
        return msg.reply(`Server levels are already enabled.`);
      } else {
        await this.client.provider.set(msg.guild.id, 'levelsEnabled', true);
        return msg.reply(`Server levels are now enabled.`);
      }
    } else if (['disable', 'd'].includes(toggle.toLowerCase())) {
      if (guildSettings.levelsEnabled) {
        this.client.provider.set(msg.guild.id, 'levelsEnabled', false);
        return msg.reply(`Server levels are now disabled.`);
      } else {
        return msg.reply(`Server levels are already disabled.`);
      }
    } else {
      return msg.reply(
        `${toggle} is an invalid state. Valid states include 'enable' and 'disable'`
      );
    }
  }
};
