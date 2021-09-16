const Commando = require('discord.js-commando');
const { convertMapToArray, convertArrayToMap } = require('../../util/map');

module.exports = class LevelRoleRemoveCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'levelroleremove',
      aliases: ['removelr'],
      group: 'serverxp',
      memberName: 'levelroleremove',
      description: 'Removes a levelrole.',
      examples: ['levelroleremove (level)'],

      args: [
        {
          key: 'level',
          prompt: 'What level should be removed?',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { level }) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('ADMINISTRATOR'))
      return msg.reply(`You don't have permission to use this command.`);

    let levelRoles = this.client.provider.get(msg.guild.id, 'levelRoles');

    levelRoles = levelRoles ? convertArrayToMap(levelRoles) : new Map();
    levelRoles.delete(Number(level));

    this.client.provider.set(
      msg.guild.id,
      'levelRoles',
      convertMapToArray(levelRoles)
    );

    return msg.reply(`Role awarded at level ${level} was removed.`);
  }
};
