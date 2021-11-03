const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const { MongoClient } = require('mongodb');

module.exports = class LevelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'level',
      group: 'serverxp',
      memberName: 'level',
      description: 'Displays your server level, rank, and total messages sent.',
    });
  }

  async run(msg) {
    const calcRankEmote = function (rank) {
      if (rank === 1) return '🥇';
      else if (rank === 2) return '🥈';
      else if (rank === 3) return '🥉';
      else return '🎀';
    };

    const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
      useUnifiedTopology: true,
    });
    await mongoClient.connect();
    const serverLevelsCollection = mongoClient
      .db(
        process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase'
      )
      .collection('serverlevels');

    if (!serverLevelsCollection)
      throw new Error('Failed to find database and/or collection');

    const guildLevelRankings = (
      await serverLevelsCollection
        .find({
          guildId: msg.guild.id,
        })
        .toArray()
    ).sort((a, b) => b.totalMessages - a.totalMessages);
    await mongoClient.close();

    let userRank =
      guildLevelRankings.length > 0 ? guildLevelRankings.length : 1;
    const userLevelDoc = guildLevelRankings.find((user, i) => {
      if (user.authorId === msg.author.id) {
        userRank = i + 1;
        return user;
      }
    });

    const rankEmoji = calcRankEmote(userRank);
    const levelEmbed = new Discord.MessageEmbed({
      title: `${msg.author.username}'s Server Activity 🗣`,
      description: `
        \`\`\`Rank:      ${userRank}  ${rankEmoji}\nLevel:     ${
        userLevelDoc?.level ? userLevelDoc.level : 0
      }  💯\nMessages:  ${
        userLevelDoc?.totalMessages
          ? Math.floor(userLevelDoc.totalMessages / 100)
          : 0
      }  💬\`\`\`
      `,
      thumbnail: {
        url: msg.author.displayAvatarURL(),
      },
      timestamp: new Date(),
      footer: {
        iconURL: this.client.user.displayAvatarURL(),
        text: 'Ciara',
      },
    });

    return msg.channel.send(levelEmbed);
  }
};
