const Commando = require('discord.js-commando');
const Discord = require('discord.js');

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
      topic: `:arrow_forward: = Resume a song :pause_button: = Pause song :track_next: = Skip a song`,
    });

    await this.client.provider.set(
      msg.guild.id,
      'musicChannelId',
      musicChannel.id
    );

    const musicEmbed = new Discord.MessageEmbed({
      title: 'No song currently playing.',
      image: {
        url: 'https://github.com/Ctrain16/Ciara/blob/main/images/CiaraLogo-480x360.jpg?raw=true',
        width: 480,
        height: 360,
      },
    });

    const sentEmbed = await musicChannel.send(musicEmbed);
    await sentEmbed.react('▶');
    await sentEmbed.react('⏸');
    await sentEmbed.react('⏭');

    await this.client.provider.set(
      msg.guild.id,
      'musicMessageId',
      sentEmbed.id
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
