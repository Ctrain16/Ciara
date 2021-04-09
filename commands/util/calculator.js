const Commando = require('discord.js-commando');
const math = require('mathjs');

module.exports = class CalculatorCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'calculator',
      aliases: ['calc', 'calculate'],
      group: 'util',
      memberName: 'calculator',
      description: 'Calculates a math expression',
      examples: ['calculator 5 + 7 / 2'],

      args: [
        {
          key: 'expression',
          prompt: 'What would you like to calculate?',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { expression }) {
    return msg.reply(`Answer: ${math.evaluate(expression)}`);
  }
};
