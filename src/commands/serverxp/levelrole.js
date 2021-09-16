const Commando = require('discord.js-commando');
const { convertMapToArray, convertArrayToMap } = require('../../util/map');

module.exports = class LevelRoleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'levelrole',
      aliases: ['level role'],
      group: 'serverxp',
      memberName: 'level role',
      description:
        'Sets roles to give users when they reach a certain server level.',
      examples: ['levelrole (level) (role)'],

      args: [
        {
          key: 'level',
          prompt: 'At what level should this role be awarded?',
          type: 'string',
        },
        {
          key: 'role',
          prompt: 'What role would you like to award at this level?',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { level, role }) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('ADMINISTRATOR'))
      return msg.reply(`You don't have permission to use this command.`);

    const roleExists = msg.guild.roles.cache.find((r) => r.toString() === role);
    if (!roleExists) return msg.reply(`Please specify a role that exists.`);

    let levelRoles = this.client.provider.get(msg.guild.id, 'levelRoles');

    levelRoles = levelRoles ? convertArrayToMap(levelRoles) : new Map();
    levelRoles.set(Number(level), role);

    this.client.provider.set(
      msg.guild.id,
      'levelRoles',
      convertMapToArray(levelRoles)
    );

    return msg.reply(
      `The role of ${role} will now be awarded at server level ${level}.`
    );
  }
};
