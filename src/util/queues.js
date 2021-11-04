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

const addUserToMuteQueue = async function (msg, unmuteTime, muteType) {
  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  });
  await mongoClient.connect();

  const muteQueueCollection = mongoClient
    .db(process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase')
    .collection('muteQueue');

  await muteQueueCollection.insertOne({
    guildId: msg.guild.id,
    authorId: msg.author.id,
    unmuteAt: unmuteTime,
    msgId: msg.id,
    channelId: msg.channel.id,
    muteType: muteType,
  });
  await mongoClient.close();
};

module.exports = {
  addUserToLevelQueue,
  addUserToMuteQueue,
};
