const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const { MongoClient } = require('mongodb');

module.exports = class CalculatorCommand extends Commando.Command {
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

    const guildLevelRankings = await serverLevelsCollection
      .find({
        guildId: msg.guild.id,
      })
      .sort((a, b) => a.totalMessages - b.totalMessages)
      .toArray();
    await mongoClient.close();

    const rankingMessage = await guildLevelRankings.reduce(
      async (message, userMongoDoc, i) => {
        const user = await this.client.users.fetch(userMongoDoc.authorId);
        const member = await msg.guild.members.fetch({ user, force: true });

        return (
          (await message) +
          `${i + 1}. ${member} - ${userMongoDoc.totalMessages} ${calcRankEmote(
            i + 1
          )}\n\n`
        );
      },
      Promise.resolve('')
    );

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
