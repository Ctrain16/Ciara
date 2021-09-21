const Commando = require('discord.js-commando');

module.exports = class MuteCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'mute',
      aliases: [],
      group: 'util',
      memberName: 'mute',
      description: 'Mutes a member for a set amount of time.',
      examples: ['mute @user x [d/h/m]'],

      args: [
        {
          key: 'user',
          prompt: 'What member would you like to mute?',
          type: 'string',
        },
        {
          key: 'timeUnit',
          prompt: `What unit of time would you like to ban them for? [d/h/m]`,
          type: 'string',
        },
        {
          key: 'numTime',
          prompt: `How long would you like to ban them for?`,
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { user, timeUnit, numTime }) {
    const userPermissions = msg.member.permissions;
    if (
      !userPermissions.has('MANAGE_CHANNELS') ||
      !userPermissions.has('MANAGE_ROLES')
    )
      return msg.reply(`You don't have permission to use this command.`);

    // 1. Create role if doesn't exist

    // 2. Update all text channels as potentially more were added

    // 3. check if user is admin (can't mute them)

    // 4. Mute user

    // 5. Set time to unmute
  }
};
