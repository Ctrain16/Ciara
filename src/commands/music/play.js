const Commando = require('discord.js-commando');
const ytdl = require('ytdl-core');
const fs = require('fs');

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

  async run(msg, { song }) {
    if (msg.member.voice.channel) {
      try {
        const connection = await msg.member.voice.channel.join();
        const dispatcher = connection.play(__dirname + '/Podcast Intro.m4a');
        console.log(fs.existsSync(__dirname + '/Podcast Intro.m4a'));
        dispatcher.on('finish', () => {
          console.log('finished');
        });

        return msg.reply(`Joined channel ${msg.member.voice.channel}`);
      } catch (err) {
        console.error(err);
      }
    } else {
    }
    return msg.reply('boo');
  }
};
