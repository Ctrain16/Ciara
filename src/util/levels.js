const { MongoClient } = require('mongodb');

const addUserToLevelQueue = async function (msg) {
  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  });
  await mongoClient.connect();

  const levelQueueCollection = mongoClient
    .db(process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase')
    .collection('levelQueue');

  await levelQueueCollection.insertOne({
    guildId: msg.guild.id,
    authorId: msg.author.id,
    timeAdded: new Date(),
    msgId: msg.id,
    channelId: msg.channel.id,
  });
  await mongoClient.close();
};

module.exports = {
  addUserToLevelQueue,
};
