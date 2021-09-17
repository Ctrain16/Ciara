const Commando = require('discord.js-commando');

module.exports = class DeleteMessagesCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'deletemessages',
      aliases: ['dm', 'delete messages', 'rm'],
      group: 'util',
      memberName: 'deletemessages',
      description: 'Deletes messages in a channel',
      examples: ['deletemessages x'],

      args: [
        {
          key: 'numMessages',
          prompt: 'How many messages would you like to delete?',
          type: 'string',
        },
        {
          key: 'confirmation',
          prompt: `Are you sure you want to do this? This is permanent. Please enter 'YES' to continue.`,
          type: 'string',
        },
      ],
    });
  }

  async run(msg, { numMessages, confirmation }) {
    const userPermissions = msg.member.permissions;
    if (!userPermissions.has('MANAGE_MESSAGES'))
      return msg.reply(`You don't have permission to use this command.`);

    if (confirmation !== 'YES')
      return msg.reply(`Command aborted as confirmation failed.`);

    msg.delete();
    msg.channel.bulkDelete(Number(numMessages));
  }
};
