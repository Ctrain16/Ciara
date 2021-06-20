const Commando = require('discord.js-commando');

module.exports = class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      aliases: ['stop'],
      group: 'music',
      memberName: 'pause',
      description: 'Pauses the current song',
    });
  }

  async run(msg) {
    if (!msg.member.voice.channel)
      return msg.reply(
        `You need to be in a voice channel in order to use this command!`
      );

    const activeGuildConnection = this.client.voice.connections.get(
      msg.guild.id
    );

    if (
      activeGuildConnection &&
      activeGuildConnection.channel !== msg.member.voice.channel
    )
      return msg.reply(
        `You must be in \` ${activeGuildConnection.channel.name} \` to use this command.`
      );

    activeGuildConnection.dispatcher.pause();
    msg.channel.send(`**Paused**  ⏸`);
  }
};
