const Commando = require('discord.js-commando');
const { json } = require('mathjs');

module.exports = class CreateConfigChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'createconfigchannel',
      aliases: ['ccc'],
      group: 'util',
      memberName: 'createconfigchannel',
      description:
        'Creates a ciara config channel that is only available for admins.',
      examples: ['createconfigchannel'],
    });
  }

  async createChannel(msg) {
    const configChannel = await msg.guild.channels.create('📑-ciara-config', {
      type: 'GUILD_TEXT',
      permissionOverwrites: [
        {
          id: msg.guild.roles.everyone,
          deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
        },
      ],
    });

    await this.client.provider.set(
      msg.guild.id,
      'configChannelId',
      configChannel.id
    );
    return msg.reply(`${configChannel} was created.`);
  }

  async run(msg) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('ADMINISTRATOR'))
      return msg.reply(`You don't have permission to use this command.`);

    const guildSettings = this.client.provider.settings.get(msg.guild.id);
    const configChannelId = guildSettings.configChannelId;

    if (!configChannelId) this.createChannel(msg);

    const configChannel = msg.guild.channels.cache.find(
      (channel) => channel.id === configChannelId
    );

    if (configChannel) return msg.reply(`${configChannel} already exists.`);

    this.createChannel(msg);
  }
};
