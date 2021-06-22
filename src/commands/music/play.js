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
      activeGuildConnection?.dispatcher?.paused &&
      !song
    ) {
      activeGuildConnection.dispatcher.resume();
      msg.channel.send(`**Resumed**  ⏯`);
      return;
    }

    if (!song) {
      msg.reply('You need to specify a song to play.');
      return;
    }

    const [songLink, songInfo] = await this.calcSongInformation(song, msg);
    if (!songLink) return msg.channel.send(`Failed to find \` ${song} \``);

    const [connection, error] = activeGuildConnection
      ? [activeGuildConnection, undefined]
      : await this.joinVoiceChannel(msg);

    if (error)
      return msg.channel.send(
        `There was an error joining \` ${msg.member.voice.channel.name} \``
      );

    if (connection.dispatcher) {
      const [songLink, songInfo] = await this.calcSongInformation(song, msg);
      connection.queue
        ? connection.queue.push({ songLink, songInfo })
        : (connection.queue = [{ songLink, songInfo }]);

      this.printQueue(connection, msg);
      return;
    }

    this.playSong(connection, songLink, songInfo, msg);
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

  playSong(connection, songLink, songInfo, msg) {
    const dispatcher = connection.play(
      ytdl(songLink, { quality: 'highestaudio', filter: 'audioonly' })
    );
    msg.channel.send(`**Playing >>>** \` ${songInfo.title} \`  🎵`);

    dispatcher.on('finish', () => {
      if (!connection.queue || connection.queue.length === 0) {
        connection.disconnect();
        msg.channel.send(
          `**Disconnected** from \` ${connection.channel.name} \`  👋`
        );
        return;
      }
      const song = connection.queue.shift();
      this.playSong(connection, song.songLink, song.songInfo, msg);
    });
  }

  printQueue(connection, msg) {
    const songQueueString = connection.queue
      .map((song, i) => `${i + 1}. ${song.songInfo.title}`)
      .join('\n');
    msg.channel.send(`**Queue:** \`\`\`${songQueueString}\`\`\``);
  }

  async calcSongInformation(song, msg) {
    if (this.validURL(song)) {
      await this.sleep(500);
      return msg.embeds.length > 0
        ? [song, msg.embeds[0]]
        : [song, { title: song }];
    } else {
      const songInfo = await this.searchYoutube(song);
      if (!songInfo) return [undefined, undefined];
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
