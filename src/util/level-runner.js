const { MongoClient } = require('mongodb');
const { convertArrayToMap } = require('./map');

const POLL_INTERVAL = 1000;

const _awardRoleToUser = async function (client, msg, newLevel) {
  const member = msg.member;
  let levelRoles = client.provider.get(msg.guild.id, 'levelRoles');
  if (!levelRoles) return '';

  levelRoles = convertArrayToMap(levelRoles);

  if (!levelRoles.has(newLevel)) return '';

  const role = member.guild.roles.cache.find(
    (r) => r.toString() === levelRoles.get(newLevel)
  );

  await member.roles.add(role);

  return `With this level increase you've been awarded the role of ${levelRoles.get(
    newLevel
  )}`;
};

const _updateUserLevel = async function (mongoClient, msg, client) {
  const authorId = msg.author.id;
  const guildId = msg.guild.id;

  const serverLevelsCollection = mongoClient
    .db(process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase')
    .collection('serverlevels');

  const filter = {
    authorId,
    guildId,
  };

  const userLevelDoc = await serverLevelsCollection.findOne(filter);
  if (userLevelDoc && (new Date() - userLevelDoc.lastupdate) / 1000 < 30) {
    // One message logged every 30 seconds to prevent spam
    return;
  } else if (!userLevelDoc) {
    console.log(
      `'${msg.author.username}' sent their first message in '${msg.guild.name}'`
    );
    await serverLevelsCollection.insertOne({
      guildId,
      authorId,
      lastupdate: new Date(),
      totalMessages: 1,
      level: 0,
    });
    return;
  }

  const isServerBooster = client.guilds.cache
    .get(guildId)
    .members.cache.get(authorId)
    .roles.cache.find((r) => {
      return r.name === 'Server Booster';
    })
    ? true
    : false;

  const updateValue = isServerBooster ? 125 : 100;
  const updateQuery = { totalMessages: updateValue };
  const newMessageCount = Math.floor(
    (userLevelDoc.totalMessages + updateValue) / 100
  );
  if ([10, 25, 50].includes(newMessageCount) || newMessageCount % 100 === 0) {
    updateQuery.level = 1;
  }

  await serverLevelsCollection.updateOne(filter, {
    $inc: updateQuery,
    $set: {
      lastupdate: new Date(),
    },
  });

  if (updateQuery.level) {
    const roleAwardedMessage = await _awardRoleToUser(
      client,
      msg,
      userLevelDoc.level + 1
    );

    await msg.reply(
      `Congratulations! You've sent **${Math.floor(
        (userLevelDoc.totalMessages + updateValue) / 100
      )}** messages in ${
        msg.guild.name
      } and as a result have been **promoted to level ${
        userLevelDoc.level + 1
      }.** ${roleAwardedMessage}`
    );
  }
};

const runJobs = async function (client) {
  // 1. connect to db
  try {
    const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
      useUnifiedTopology: true,
    });
    await mongoClient.connect();

    // 2. get all items in queue with unique user id
    const levelQueueCollectionItems = await mongoClient
      .db(
        process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase'
      )
      .collection('levelQueue')
      .find()
      .toArray();

    // 3. update each item
    for (const item of levelQueueCollectionItems) {
      try {
        const message = await client.channels.cache
          .get(item.channelId)
          .messages.fetch(item.msgId);
        await _updateUserLevel(mongoClient, message, client);
        await mongoClient
          .db(
            process.env.NODE_ENV === 'development'
              ? 'ciaraDevDb'
              : 'ciaraDataBase'
          )
          .collection('levelQueue')
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
  }
};

const initLevelRunner = async function (client) {
  console.log('Level Queue Runner Initialized');
  setInterval(runJobs, POLL_INTERVAL, client);
};

module.exports = {
  initLevelRunner,
};
