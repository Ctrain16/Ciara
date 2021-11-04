const { MongoClient } = require('mongodb');

const POLL_INTERVAL = 60000;

const _unTextMuteUser = async function (client, guildId, authorId, channelId) {
  const muteRoleId = client.provider.get(guildId, 'textmuteRoleId');
  let muteRole = null;
  if (muteRoleId) {
    muteRole = client.guilds.cache
      .get(guildId)
      .roles.cache.find((r) => r.id === muteRoleId);
  }
  if (!muteRole) return;

  const userToUnmute = await client.guilds.cache
    .get(guildId)
    .members.fetch(authorId);
  userToUnmute.roles.remove(muteRole);

  (await client.channels.cache.get(channelId)).send(
    `${userToUnmute} you have been unmuted... watch yourself.`
  );
};

const runJobs = async function (client) {
  // 1. connect to db
  let mongoClient = null;
  try {
    mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
      useUnifiedTopology: true,
    });
    await mongoClient.connect();

    // 2. get all items in queue with unique user id
    const muteQueueCollectionItems = await mongoClient
      .db(
        process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase'
      )
      .collection('muteQueue')
      .find({ unmuteAt: { $lte: Date.now() } })
      .toArray();

    // 3. update each item
    for (const item of muteQueueCollectionItems) {
      try {
        if (item.muteType === 'text') {
          await _unTextMuteUser(
            client,
            item.guildId,
            item.userId,
            item.channelId
          );
        }
        await mongoClient
          .db(
            process.env.NODE_ENV === 'development'
              ? 'ciaraDevDb'
              : 'ciaraDataBase'
          )
          .collection('muteQueue')
          .deleteOne({ _id: item._id });
      } catch (error) {
        console.error('LEVEL RUNNER ERROR', error);
        continue;
      }
    }

    // 4. disconnect from db
    await mongoClient.close();
  } catch (error) {
    console.error(
      'LEVEL RUNNER ERROR: Failed to connect to mongo in level runner',
      error
    );
    await mongoClient.close();
  }
};

const initMuteRunner = async function (client) {
  console.log('Mute Queue Runner Initialized');
  setInterval(runJobs, POLL_INTERVAL, client);
};

module.exports = {
  initMuteRunner,
};
