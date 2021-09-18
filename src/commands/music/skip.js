const Commando = require('discord.js-commando');

module.exports = class SkipCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: ['fs'],
      group: 'music',
      memberName: 'skip',
      description: 'Skips the current song',
    });
  }

  async run(msg, { isMusicChannel = false }) {
    if (!msg.member.voice.channel) {
      if (!isMusicChannel)
        msg.reply(
          `You need to be in a voice channel in order to use this command!`
        );
      return;
    }

    const activeGuildConnection = this.client.voice.connections.get(
      msg.guild.id
    );

    if (!activeGuildConnection) {
      if (!isMusicChannel) msg.reply(`There is currently no song playing`);
      return;
    }

    if (activeGuildConnection.channel !== msg.member.voice.channel) {
      if (!isMusicChannel)
        msg.reply(
          `You must be in \` ${activeGuildConnection.channel.name} \` to use this command.`
        );
      return;
    }

    if (!isMusicChannel) msg.channel.send(`**Skipped**  ⏭`);
    activeGuildConnection.dispatcher.emit('finish');
  }
};
