const Commando = require('discord.js-commando');
const { convertMapToArray, convertArrayToMap } = require('../../util/map');

module.exports = class ProtectChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'protectchannel',
      aliases: ['pg'],
      group: 'util',
      memberName: 'protectchannel',
      description:
        'Adds/removes channels to list of channels to protect. Global setting "channelprotection" needs to be enabled. See togglechannelprotection command.',
      examples: ['protectchannel (channel) (add|remove)'],

      args: [
        {
          key: 'channel',
          prompt:
            'What channel would you like to add/remove from the protected channel list?',
          type: 'string',
        },
        {
          key: 'toggle',
          prompt:
            'Would you like to add or remove this channel from the protected channel list?',
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { channel, toggle }) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('ADMINISTRATOR'))
      return msg.reply(`You don't have permission to use this command.`);

    const channelExists = msg.guild.channels.cache.find(
      (c) => c.toString() === channel
    );

    if (!channelExists)
      return msg.reply(`Please specify a channel that exists.`);

    if (['add', 'a'].includes(toggle.toLowerCase())) {
      let protectedChannels = this.client.provider.get(
        msg.guild.id,
        'protectedChannels'
      );
      protectedChannels = protectedChannels
        ? new Set(protectedChannels)
        : new Set();
      protectedChannels.add(channel);

      this.client.provider.set(msg.guild.id, 'protectedChannels', [
        ...protectedChannels,
      ]);

      return msg.reply(
        `${channel} has been added to the protected channel list.`
      );
    } else if (['remove', 'r'].includes(toggle.toLowerCase())) {
      let protectedChannels = this.client.provider.get(
        msg.guild.id,
        'protectedChannels'
      );
      protectedChannels = protectedChannels
        ? new Set(protectedChannels)
        : new Set();

      if (protectedChannels.has(channel)) {
        protectedChannels.delete(channel);

        this.client.provider.set(msg.guild.id, 'protectedChannels', [
          ...protectedChannels,
        ]);
        return msg.reply(
          `${channel} has been removed from the protected channel list.`
        );
      } else {
        return msg.reply(`${channel} is not on the protected channel list.`);
      }
    } else {
      return msg.reply(
        `${toggle} is an invalid state. Valid states include 'add' and 'remove'`
      );
    }
  }
};
