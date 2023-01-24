const Commando = require('discord.js-commando');

module.exports = class RuleChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'rulechannel',
      aliases: [],
      group: 'util',
      memberName: 'rulechannel',
      description: 'Sets the guilds rule channel.',
      examples: ['rulechannel #rules'],

      args: [
        {
          key: 'channel',
          prompt: 'What is the rule channel?',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { channel }) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('ADMINISTRATOR'))
      return msg.reply(`You don't have permission to use this command.`);

    const channelExists = msg.guild.channels.cache.find(
      (c) => c.toString() === channel
    );
    if (channelExists) {
      this.client.provider.set(msg.guild.id, 'ruleChannel', channel);
      console.log(
        `${channelExists.name} has been set as ${msg.guild}'s rule channel.`
      );
      return msg.reply(
        `${channel} has been set as ${msg.guild}'s rule channel.`
      );
    } else {
      return msg.reply(`Please specify a channel that exists.`);
    }
  }
};
