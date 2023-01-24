const { MongoClient } = require('mongodb');
const { convertArrayToMap } = require('./map');
const { DiscordAPIError } = require('discord.js');

const TIME_BETWEEN_LEVEL_INCREASE_IN_SECONDS = 30;
const FARMER_REGEX = /([Ff]+[ ]*[Aa]+[ ]*[Rr]+[ ]*[Mm ]+)\w*/;
const BASE_MESSAGE_VALUE = 100;
const BOOSTED_MESSAGE_VALUE = 125;
const FARM_RELATED_WORDS = [
  'harvest',
  'harvesting',
  'plantation',
  'crop',
  'agriculture',
  'agricultural',
  'agronomic',
  'cultivate',
  'cultivation',
  'barn',
  'ranch',
  'ranching',
  'rancher',
  'livestock',
  'planting',
  'orchard',
  'herding',
  'nurture',
  'hatchery',
  'breeding',
  'chickens',
  'gardening',
  'watering',
  'pesticide',
  'pesticides',
  'manure',
  'eggs',
  'cattle',
];

const FARM_PENALTY = -1000;

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

  const isCaptain = client.guilds.cache
    .get(guildId)
    .members.cache.get(authorId)
    .roles.cache.find((r) => {
      return r.name === 'Captain';
    })
    ? true
    : false;
  const authorIsOwner = client.isOwner(msg.author);

  let updateValue = BASE_MESSAGE_VALUE;
  if (isCaptain || authorIsOwner) {
    updateValue = BOOSTED_MESSAGE_VALUE;
  }

  const userLevelDoc = await serverLevelsCollection.findOne(filter);
  if (!userLevelDoc) {
    console.log(
      `'${msg.author.username}' sent their first message in '${msg.guild.name}'`
    );
    await serverLevelsCollection.insertOne({
      guildId,
      authorId,
      lastupdate: new Date(),
      totalMessages: updateValue,
      level: 0,
    });
    return;
  } else if (_isFarmMessage(msg) && !authorIsOwner) {
    updateValue = FARM_PENALTY;
    await msg.reply(
      `👩‍🌾 Quit farming ${msg.channel} you noob 👨‍🌾 ... also you lost some points for this peasant. #SkillIssue #SoundsMad`
    );
  } else if (_isSpamMessage(userLevelDoc)) {
    return; // don't aware points for spam messages
  }

  const updateQuery = { totalMessages: updateValue };
  const newMessageCount = Math.floor(
    (userLevelDoc.totalMessages + updateValue) / BASE_MESSAGE_VALUE
  );

  if (
    ([10, 25, 50].includes(newMessageCount) ||
      newMessageCount % BASE_MESSAGE_VALUE === 0) &&
    _isValidLevelUp(userLevelDoc.level, updateValue, newMessageCount)
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

const _isSpamMessage = function (userLevelDoc) {
  return (
    userLevelDoc &&
    (new Date() - userLevelDoc.lastupdate) / 1000 <
      TIME_BETWEEN_LEVEL_INCREASE_IN_SECONDS
  );
};

const _isFarmMessage = function (msg) {
  if (FARMER_REGEX.test(msg.content)) return true;

  let farmRelatedWordInMessage = false;
  for (const word of FARM_RELATED_WORDS) {
    if (msg.content.includes(word)) {
      return true;
    }
  }

  return farmRelatedWordInMessage;
};

/**
 * Checks if level up is valid. Prevents against cases where user goes below
 * level threshold with newly introduced negative points logicand then
 * increases again.
 * @param {*} userLevel
 * @param {*} updateValue
 * @param {*} newMessageCount
 */
const _isValidLevelUp = function (userLevel, updateValue, newMessageCount) {
  if (updateValue < 0) return false;

  if (newMessageCount === 10 && userLevel === 0) return true;
  else if (newMessageCount === 25 && userLevel === 1) return true;
  else if (newMessageCount === 50 && userLevel === 2) return true;
  else if (newMessageCount / BASE_MESSAGE_VALUE + 2 === userLevel) return true;

  return false;
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
        // Delete message on any errors
        await mongoClient
          .db(
            process.env.NODE_ENV === 'development'
              ? 'ciaraDevDb'
              : 'ciaraDataBase'
          )
          .collection('levelQueue')
          .deleteOne({ _id: item._id });

        continue;
      }
    }

    // 4. disconnect from db
    await mongoClient.close();

    // 5. Pause 1 second and then recursive call
    sleep(1000);
    runJobs(client);
  } catch (error) {
    console.error(
      'LEVEL RUNNER ERROR: Failed to connect to mongo in level runner',
      error
    );
    await mongoClient.close();

    sleep(1000);
    runJobs(client);
  }
};

const sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const initLevelRunner = async function (client) {
  console.log('Level Queue Runner Initialized');
  runJobs(client);
};

module.exports = {
  initLevelRunner,
};
