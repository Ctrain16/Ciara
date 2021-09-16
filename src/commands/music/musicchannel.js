const Commando = require('discord.js-commando');

module.exports = class CreateMusicChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'createmusicchannel',
      aliases: ['cmc'],
      group: 'music',
      memberName: 'createmusicchannel',
      description: 'Creates a Ciara music channel.',
      examples: ['createmusicchannel'],
    });
  }

  async createChannel(msg) {
    const musicChannel = await msg.guild.channels.create('🎶-ciara-dj', {
      type: 'GUILD_TEXT',
      topic: 'Instructions for dj channel',
    });

    await this.client.provider.set(
      msg.guild.id,
      'musicChannelId',
      musicChannel.id
    );
    return msg.reply(`${musicChannel} was created.`);
  }

  async run(msg) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('ADMINISTRATOR'))
      return msg.reply(`You don't have permission to use this command.`);

    const guildSettings = await this.client.provider.settings.get(msg.guild.id);
    const musicChannelId = guildSettings.musicChannelId;

    if (!musicChannelId) {
      await this.createChannel(msg);
      return;
    }

    const musicChannel = msg.guild.channels.cache.find(
      (channel) => channel.id === musicChannelId
    );

    if (musicChannel) return msg.reply(`${musicChannel} already exists.`);

    await this.createChannel(msg);
  }
};
