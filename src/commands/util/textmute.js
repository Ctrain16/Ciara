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

    const muteRoleId = this.client.provider.get(msg.guild.id, 'textmuteRoleId');
    let muteRole = null;
    if (muteRoleId) {
      muteRole = msg.guild.roles.cache.find((r) => r.id === muteRoleId);
    }

    if (!muteRole) {
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
    }

    msg.guild.channels.cache.forEach((channel) => {
      channel.updateOverwrite(muteRole, {
        CREATE_PUBLIC_THREADS: false,
        CREATE_PRIVATE_THREADS: false,
        SEND_MESSAGES_IN_THREADS: false,
        SEND_MESSAGES: false,
      });
    });

    const userToMute = automute
      ? user
      : msg.guild.members.cache.find(
          (member) => `<@!${member.user.id}>` === user
        );
    if (userToMute.permissions.has('ADMINISTRATOR')) {
      if (!automute) msg.reply(`${user} cannot be muted as they are an admin.`);
      return;
    }

    if (userToMute.roles.cache.find((role) => role.id === muteRole.id)) {
      if (!automute) msg.reply(`${user} is already text muted.`);
      return;
    }
    userToMute.roles.add(muteRole);

    setTimeout(() => {
      msg.channel.send(`${user} you have been unmuted... watch yourself.`);
      userToMute.roles.remove(muteRole);
    }, timeToMute);

    return automute
      ? msg.channel.send(`${user} you say something?`)
      : msg.reply(`${user} was text muted for ${numTime} ${timeUnit}.`);
  }
};
