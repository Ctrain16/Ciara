const Commando = require('discord.js-commando');

module.exports = class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: ['fs'],
      group: 'music',
      memberName: 'skip',
      description: 'Skips the current song',
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

    if (!activeGuildConnection)
      return msg.reply(`There is currently no song playing`);

    if (activeGuildConnection.channel !== msg.member.voice.channel)
      return msg.reply(
        `You must be in \` ${activeGuildConnection.channel.name} \` to use this command.`
      );

    msg.channel.send(`**Skipped**  ⏭`);
    activeGuildConnection.dispatcher.emit('finish');
  }
};
