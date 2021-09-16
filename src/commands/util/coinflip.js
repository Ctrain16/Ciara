const Commando = require('discord.js-commando');

module.exports = class CoinFlipCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'coinflip',
      aliases: ['cf', 'flip'],
      group: 'util',
      memberName: 'coinflip',
      description: 'Flips a coin.',
    });
  }

  run(msg) {
    return msg.channel.send(Math.random() < 0.5 ? 'Heads' : 'Tails');
  }
};
