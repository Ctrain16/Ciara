const Commando = require('discord.js-commando');

module.exports = class DisconnectCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'disconnect',
      aliases: ['dc', 'stop'],
      group: 'music',
      memberName: 'disconnect',
      description: `Disconnects the bot from the voice channel`,
    });
  }

  async run(msg, { isMusicChannel = false }) {
    const activeGuildConnection = this.client.voice.connections.get(
      msg.guild.id
    );

    if (!activeGuildConnection)
      if (!isMusicChannel) return msg.reply(`I'm not in a voice channel`);

    if (!msg.member.voice.channel)
      if (!isMusicChannel)
        return msg.reply(
          `You need to be in a voice channel in order to use this command!`
        );

    if (activeGuildConnection.channel !== msg.member.voice.channel)
      if (!isMusicChannel)
        return msg.reply(
          `You must be in \` ${activeGuildConnection.channel.name} \` to use this command.`
        );

    activeGuildConnection.queue = [];
    activeGuildConnection.dispatcher.emit('finish');
  }
};
