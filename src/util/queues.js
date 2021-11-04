const { MongoClient } = require('mongodb');

const addUserToLevelQueue = async function (msg) {
  let mongoClient = null;
  try {
    mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
      useUnifiedTopology: true,
    });
    await mongoClient.connect();

    const levelQueueCollection = mongoClient
      .db(
        process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase'
      )
      .collection('levelQueue');

    await levelQueueCollection.insertOne({
      guildId: msg.guild.id,
      authorId: msg.author.id,
      timeAdded: new Date(),
      msgId: msg.id,
      channelId: msg.channel.id,
    });
    await mongoClient.close();
  } catch (error) {
    console.error('ERROR adding user to level queue.', error);
    if (mongoClient) await mongoClient.close();
  }
};

const addUserToMuteQueue = async function (
  msg,
  userToMute,
  unmuteTime,
  muteType
) {
  let mongoClient = null;
  try {
    mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
      useUnifiedTopology: true,
    });
    await mongoClient.connect();

    const muteQueueCollection = mongoClient
      .db(
        process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase'
      )
      .collection('muteQueue');

    await muteQueueCollection.insertOne({
      guildId: msg.guild.id,
      userId: userToMute.id,
      unmuteAt: unmuteTime,
      msgId: msg.id,
      channelId: msg.channel.id,
      muteType: muteType,
    });
    await mongoClient.close();
  } catch (error) {
    console.error('ERROR adding user to mute queue.', error);
    if (mongoClient) await mongoClient.close();
  }
};

module.exports = {
  addUserToLevelQueue,
  addUserToMuteQueue,
};
