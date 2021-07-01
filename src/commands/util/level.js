const Commando = require('discord.js-commando');
const { MongoClient } = require('mongodb');

module.exports = class CalculatorCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'level',
      group: 'util',
      memberName: 'level',
      description: 'Checks your server level.',
    });
  }

  async run(msg) {
    const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
      useUnifiedTopology: true,
    });
    await mongoClient.connect();
    const serverLevelsCollection = mongoClient
      .db('ciaraDataBase')
      .collection('serverlevels');

    if (!serverLevelsCollection)
      throw new Error('Failed to find database and/or collection');

    const userLevelDoc = await serverLevelsCollection.findOne({
      authorId: msg.author.id,
      guildId: msg.guild.id,
    });

    await mongoClient.close();

    return msg.reply(
      !userLevelDoc
        ? `Congrats on your first message here! You're **Level: 0**`
        : `you are **Level: ${userLevelDoc.level}**`
    );
  }
};
