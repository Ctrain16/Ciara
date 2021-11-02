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

  // TODO switch level system to be based of 100's so I can easily do 1.25 and 1.5 for nitro and server boosters
  const updateValue = 100; // TODO detemrine if this needs to be deferent based on above critierai
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
      `Congratulations! You've sent **${
        userLevelDoc.totalMessages + 1
      }** messages in ${
        msg.guild.name
      } and as a result have been **promoted to level ${
        userLevelDoc.level + 1
      }.** ${roleAwardedMessage}`
    );
  }
};

const runJobs = async function () {
  // 1. connect to db
  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  });
  await mongoClient.connect();

  // 2. get all items in queue with unique user id

  // 3. update each item

  // 4. handle errors

  // 5. disconnect from db
  await mongoClient.close();
};

const initLevelRunner = async function () {
  console.log('Level Queue Runner Initialized');
  setInterval(runJobs, POLL_INTERVAL);
};

module.exports = {
  initLevelRunner,
};
