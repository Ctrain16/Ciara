const Commando = require('discord.js-commando');

module.exports = class TextMuteCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'textmute',
      aliases: ['tm'],
      group: 'util',
      memberName: 'textmute',
      description: 'Mutes a member in text channels for a set amount of time.',
      examples: ['textmute @user x [d/h/m]'],

      args: [
        {
          key: 'user',
          prompt: 'What member would you like to text mute?',
          type: 'string',
        },
        {
          key: 'timeUnit',
          prompt: `What unit of time would you like to mute them for? [d/h/m]`,
          type: 'string',
        },
        {
          key: 'numTime',
          prompt: `How long would you like to mute them for?`,
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { user, timeUnit, numTime, automute = false }) {
    const userPermissions = msg.member.permissions;
    if (
      !automute &&
      (!userPermissions.has('MANAGE_CHANNELS') ||
        !userPermissions.has('MANAGE_ROLES'))
    )
      return msg.reply(`You don't have permission to use this command.`);

    if (isNaN(numTime)) {
      if (!automute) msg.reply(`Invalid time.`);
      return;
    }

    let timeToMute = null;
    if (timeUnit === 'm') {
      timeToMute = numTime * 60000;
    } else if (timeUnit === 'h') {
      timeToMute = numTime * 60000 * 60;
    } else if (timeUnit === 'd') {
      timeToMute = numTime * 60000 * 60 * 24;
    } else {
      if (!automute)
        msg.reply('Invalid time unit. Accepted units include d/h/m.');
      return;
    }

    // 1. Create role if doesn't exist
    const muteRoleId = this.client.provider.get(msg.guild.id, 'textmuteRoleId');
    let muteRole = null;
    if (!muteRoleId) {
      muteRole = await msg.guild.roles.create({
        data: {
          name: 'ciaraMuted',
          color: 'GRAY',
        },
      });
      await this.client.provider.set(
        msg.guild.id,
        'textmuteRoleId',
        muteRole.id
      );
    } else {
      muteRole = msg.guild.roles.cache.find((r) => r.id === muteRoleId);
    }

    // 2. Update all text channels as potentially more were added
    msg.guild.channels.cache.forEach((channel) => {
      channel.updateOverwrite(muteRole, {
        SEND_MESSAGES: false,
      });
    });

    // 3. check if user is admin (can't mute them)
    const userToMute = automute
      ? user
      : msg.guild.members.cache.find(
          (member) => `<@!${member.user.id}>` === user
        );
    if (userToMute.permissions.has('ADMINISTRATOR')) {
      if (!automute)
        msg.reply(`This person cannot be muted as they are an admin.`);
      return;
    }

    // 4. Mute user
    userToMute.roles.add(muteRole);

    // 5. Set time to unmute
    setTimeout(() => {
      userToMute.roles.remove(muteRole);
    }, timeToMute);

    return automute
      ? msg.channel.send(`${user} you say something?`)
      : msg.reply(`${user} was text muted for ${numTime} ${timeUnit}.`);
  }
};
