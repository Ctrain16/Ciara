const { MongoClient } = require('mongodb');
const { convertArrayToMap } = require('./map');

const updateUserLevel = async function (msg, client) {
  const authorId = msg.author.id;
  const guildId = msg.guild.id;

  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  });
  await mongoClient.connect();
  const serverLevelsCollection = mongoClient
    .db(process.env.NODE_ENV === 'development' ? 'ciaraDevDb' : 'ciaraDataBase')
    .collection('serverlevels');

  const filter = {
    authorId,
    guildId,
  };

  const userLevelDoc = await serverLevelsCollection.findOne(filter);
  if (userLevelDoc && (new Date() - userLevelDoc.lastupdate) / 1000 > 30) {
    // One message logged every 30 seconds to prevent spam
    const updateQuery = { totalMessages: 1 };

    if (
      [10, 25, 50].includes(userLevelDoc.totalMessages + 1) ||
      (userLevelDoc.totalMessages + 1) % 100 === 0
    ) {
      updateQuery.level = 1;
    }

    await serverLevelsCollection.updateOne(filter, {
      $inc: updateQuery,
      $set: {
        lastupdate: new Date(),
      },
    });

    if (updateQuery.level) {
      const roleAwardedMessage = await awardRole(
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
  }

  await mongoClient.close();
};

const awardRole = async function (client, msg, newLevel) {
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

module.exports = {
  updateUserLevel,
};
