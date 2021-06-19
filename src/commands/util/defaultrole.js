const Commando = require('discord.js-commando');

module.exports = class CalculatorCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'setrole',
      aliases: ['set role'],
      group: 'util',
      memberName: 'set role',
      description: 'Sets the default role to give new members.',
      examples: ['setrole @member'],

      args: [
        {
          key: 'role',
          prompt: 'What role would you like to give new members?',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { role }) {
    const roleExists = msg.guild.roles.cache.find((r) => r.toString() === role);
    if (roleExists) {
      this.client.provider.set(msg.guild.id, 'defaultRole', role);
      return msg.reply(`${role} will now be given to new members.`);
    } else {
      return msg.reply(`Please specify a role that exists.`);
    }
  }
};
