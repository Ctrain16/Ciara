const Commando = require('discord.js-commando');

const eightBallResponses = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes – definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  "Don't count on it.",
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.',
];

module.exports = class EightBallCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'eightball',
      aliases: ['8ball', '8-ball'],
      group: 'fun',
      memberName: 'eightball',
      description: 'Answers a question.',
      examples: ['eightball will I win the lottery?'],

      args: [
        {
          key: 'question',
          prompt: 'What would you like to ask the eightball?',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { question }) {
    return msg.reply(
      eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)]
    );
  }
};
