const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const { MongoClient } = require('mongodb');

module.exports = class LeaderboardCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      group: 'serverxp',
      memberName: 'leaderboard',
      description: 'Displays the server activity leaderboard',
    });
  }

  async run(msg) {
    const calcRankEmote = function (rank) {
      if (rank === 1) return '🥇';
      else if (rank === 2) return '🥈';
      else if (rank === 3) return '🥉';
      else return '';
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

    let rankingMessage = '';
    for (let i = 0; i < Math.min(10, guildLevelRankings.length); i++) {
      const userMongoDoc = guildLevelRankings[i];
      let username = 'Former Member';
      try {
        const user = await this.client.users.fetch(userMongoDoc.authorId);
        username = await msg.guild.members.fetch({ user, force: true });
      } catch (error) {
        console.error('LEADERBOARD.js: ', error);
      }

      rankingMessage += `${i + 1}. ${username} - ${Math.floor(
        userMongoDoc.totalMessages / 100
      )} ${calcRankEmote(i + 1)}\n\n`;
    }

    const levelEmbed = new Discord.MessageEmbed({
      title: `🏆 ${msg.guild}'s Activity Leaderboard 🏆`,
      description: `${rankingMessage}`,
      timestamp: new Date(),
      footer: {
        iconURL: this.client.user.displayAvatarURL(),
        text: 'Ciara',
      },
    });

    return msg.channel.send(levelEmbed);
  }
};
