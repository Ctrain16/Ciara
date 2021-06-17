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
    this.client.provider.set(msg.guild.id, 'defaultRole', role);
    console.log(this.client.provider.settings);
    return msg.reply(`${role} will now be given to new members.`);
  }
};
