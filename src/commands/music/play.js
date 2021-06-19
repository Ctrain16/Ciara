const Commando = require('discord.js-commando');
const ytdl = require('ytdl-core');
const fs = require('fs');
const fetch = require('node-fetch');
const youtubeSearch = require('youtube-search');

module.exports = class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p'],
      group: 'music',
      memberName: 'play',
      description: 'Plays a song',
      examples: ['play song-name/linke'],

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
    if (!msg.member.voice.channel) {
      return msg.reply(
        `You need to be in a voice channel in order to use this command!`
      );
    }

    const [connection, error] = await this.tryCatchForAsync(
      msg.member.voice.channel.join()
    );

    if (error) {
      return msg.channel.send(`There was an error joining the voice channel.`);
    }

    const songLink = this.validURL(song) ? song : this.searchYoutube(song);
    console.log(songLink);
    await this.sleep(1000); // buffer for embed to load
    console.dir(msg?.embeds);
    const dispatcher = connection.play(
      ytdl(songLink, { quality: 'highestaudio', filter: 'audioonly' })
    );

    return msg.channel.send(
      `Joined \` ${msg.member.voice.channel.name} \`, and began playing ${song}`
    );
  }

  validURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(str);
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Helper function to help with error handling for async-await
   * @param {Promise} promise
   * @returns
   */
  async tryCatchForAsync(promise) {
    try {
      const data = await promise;
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  }

  searchYoutube(song) {
    const opts = {
      maxResults: 1,
      key: process.env.YOUTUBE_API_KEY,
    };

    return youtubeSearch(song, opts, function (err, results) {
      if (err) {
        console.error(error);
        return undefined;
      }

      console.dir(results);
      return results[0].link;
    });
  }
};
