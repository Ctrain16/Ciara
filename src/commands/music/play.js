const Commando = require('discord.js-commando');
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');

module.exports = class PlayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p'],
      group: 'music',
      memberName: 'play',
      description: 'Plays a song',

      args: [
        {
          key: 'song',
          prompt: 'What song would you like to play',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  async run(msg, { song }) {
    if (!msg.member.voice.channel)
      return msg.reply(
        `You need to be in a voice channel in order to use this command!`
      );

    const activeGuildConnection = this.client.voice.connections.get(
      msg.guild.id
    );

    if (
      activeGuildConnection &&
      activeGuildConnection.channel !== msg.member.voice.channel
    )
      return msg.reply(
        `${this.client.user.username} is already bound to \` ${activeGuildConnection.channel.name} \``
      );

    if (
      activeGuildConnection &&
      activeGuildConnection.channel === msg.member.voice.channel &&
      activeGuildConnection.dispatcher.paused
    ) {
      activeGuildConnection.dispatcher.resume();
      msg.channel.send(`**Resumed**  ⏯`);
      return;
    }

    if (!song) {
      msg.reply('You need to specify a song to play.');
      return;
    }

    const [connection, error] = activeGuildConnection
      ? [activeGuildConnection, undefined]
      : await this.joinVoiceChannel(msg);

    if (error)
      return msg.channel.send(
        `There was an error joining \` ${msg.member.voice.channel.name} \``
      );

    const [songLink, songInfo] = await this.calcSongInformation(song, msg);
    const dispatcher = connection.play(
      ytdl(songLink, { quality: 'highestaudio', filter: 'audioonly' })
    );

    return msg.channel.send(`**Playing >>>** \` ${songInfo.title} \`  🎵`);
  }

  async joinVoiceChannel(msg) {
    const [connection, error] = await this.tryCatchForAsync(
      msg.member.voice.channel.join()
    );
    if (connection)
      msg.channel.send(
        `**Joined >>>** \` ${msg.member.voice.channel.name} \`  👋`
      );
    return [connection, error];
  }

  async calcSongInformation(song, msg) {
    if (this.validURL(song)) {
      await this.sleep(500);
      return [song, msg.embeds[0]];
    } else {
      const songInfo = await this.searchYoutube(song);
      return [songInfo.link, songInfo];
    }
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

  async tryCatchForAsync(promise) {
    try {
      const data = await promise;
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  }

  async searchYoutube(song) {
    const opts = {
      maxResults: 1,
      key: process.env.YOUTUBE_API_KEY,
    };

    try {
      const searchResults = await youtubeSearch(song, opts);
      return searchResults.results[0];
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }
};
