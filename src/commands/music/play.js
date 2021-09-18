const Commando = require('discord.js-commando');
const ytdl = require('ytdl-core');
const youtubeSearch = require('youtube-search');
const Discord = require('discord.js');

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

  async run(msg, { song, isMusicChannel = false }) {
    if (!msg.member.voice.channel) {
      if (!isMusicChannel)
        return msg.reply(
          `You need to be in a voice channel in order to use this command!`
        );
      return;
    }

    const activeGuildConnection = this.client.voice.connections.get(
      msg.guild.id
    );

    if (
      activeGuildConnection &&
      activeGuildConnection.channel !== msg.member.voice.channel
    ) {
      if (!isMusicChannel)
        return msg.reply(
          `${this.client.user.username} is already bound to \` ${activeGuildConnection.channel.name} \``
        );
      return;
    }

    if (
      activeGuildConnection &&
      activeGuildConnection.channel === msg.member.voice.channel &&
      activeGuildConnection?.dispatcher?.paused &&
      !song
    ) {
      activeGuildConnection.dispatcher.resume();
      if (!isMusicChannel) msg.channel.send(`**Resumed**  ⏯`);
      return;
    }

    if (!song) {
      if (!isMusicChannel) msg.reply('You need to specify a song to play.');
      return;
    }

    const [songLink, songInfo] = await this.calcSongInformation(song, msg);
    if (!songLink && !isMusicChannel)
      return msg.channel.send(`Failed to find \` ${song} \``);

    const [connection, error] = activeGuildConnection
      ? [activeGuildConnection, undefined]
      : await this.joinVoiceChannel(msg, isMusicChannel);

    if (error && !isMusicChannel)
      return msg.channel.send(
        `There was an error joining \` ${msg.member.voice.channel.name} \``
      );

    if (connection.dispatcher) {
      const [songLink, songInfo] = await this.calcSongInformation(song, msg);
      connection.queue
        ? connection.queue.push({ songLink, songInfo })
        : (connection.queue = [{ songLink, songInfo }]);

      this.printQueue(connection, msg, isMusicChannel);
      return;
    }

    this.playSong(connection, songLink, songInfo, msg, isMusicChannel);
  }

  async joinVoiceChannel(msg, isMusicChannel) {
    const [connection, error] = await this.tryCatchForAsync(
      msg.member.voice.channel.join()
    );
    if (connection && !isMusicChannel)
      msg.channel.send(
        `**Joined >>>** \` ${msg.member.voice.channel.name} \`  👋`
      );
    return [connection, error];
  }

  async playSong(connection, songLink, songInfo, msg, isMusicChannel) {
    const dispatcher = connection.play(
      ytdl(songLink, { quality: 'highestaudio', filter: 'audioonly' })
    );
    if (!isMusicChannel)
      msg.channel.send(`**Playing >>>** \` ${songInfo.title} \`  🎵`);
    else {
      const embedId = this.client.provider.get(msg.guild.id, 'musicMessageId');
      const embedMessage = await msg.channel.messages.fetch(embedId);

      const musicEmbed = new Discord.MessageEmbed({
        title: songInfo.title,
        image: songInfo.thumbnails.high,
        description:
          connection.queue && connection.queue.length > 0
            ? `**Queue:** \`\`\`${connection.queue
                .map((song, i) => `${i + 1}. ${song.songInfo.title}`)
                .join('\n')}\`\`\``
            : null,
      });

      embedMessage.edit(musicEmbed);
    }

    dispatcher.on('finish', async () => {
      if (!connection.queue || connection.queue.length === 0) {
        connection.disconnect();
        if (!isMusicChannel)
          msg.channel.send(
            `**Disconnected** from \` ${connection.channel.name} \`  👋`
          );
        else {
          const embedId = this.client.provider.get(
            msg.guild.id,
            'musicMessageId'
          );
          const embedMessage = await msg.channel.messages.fetch(embedId);
          const musicEmbed = new Discord.MessageEmbed({
            title: 'No song currently playing.',
            image: {
              url: 'https://github.com/Ctrain16/Ciara/blob/main/images/CiaraLogo-480x360.jpg?raw=true',
              width: 480,
              height: 360,
            },
          });

          embedMessage.edit(musicEmbed);
        }
        return;
      }
      const song = connection.queue.shift();
      this.playSong(
        connection,
        song.songLink,
        song.songInfo,
        msg,
        isMusicChannel
      );
    });
  }

  async printQueue(connection, msg, isMusicChannel) {
    const songQueueString = connection.queue
      .map((song, i) => `${i + 1}. ${song.songInfo.title}`)
      .join('\n');
    if (!isMusicChannel)
      msg.channel.send(`**Queue:** \`\`\`${songQueueString}\`\`\``);
    else {
      const embedId = this.client.provider.get(msg.guild.id, 'musicMessageId');
      const embedMessage = await msg.channel.messages.fetch(embedId);

      const musicEmbed = new Discord.MessageEmbed(
        embedMessage.embeds[0]
      ).setDescription(`**Queue:** \`\`\`${songQueueString}\`\`\``);

      embedMessage.edit(musicEmbed);
    }
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
