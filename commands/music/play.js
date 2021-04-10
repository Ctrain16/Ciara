const Commando = require('discord.js-commando');
const ytdl = require('ytdl-core');

module.exports = class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p'],
      group: 'music',
      memberName: 'play',
      description: 'Plays a song',
      examples: ['play song name/link to song/audio file'],

      args: [
        {
          key: 'song',
          prompt: 'What song would you like to play',
          type: 'string',
        },
      ],
    });
  }

  run(msg, { song }) {
    if (msg.member.voice.channel) {
      const connection = msg.member.voice.channel.join();
      const dispatcher = connection.play(
        ytdl('https://www.youtube.com/watch?v=ZlAU_w7-Xp8', {
          quality: 'highestaudio',
        })
      );
      return msg.reply(`Joined channel ${msg.member.voice.channel}`);
    } else {
      return msg.reply('You must be in a voice channel to use this command.');
    }
  }
};
