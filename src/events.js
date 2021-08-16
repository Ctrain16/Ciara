const Discord = require('discord.js');
const { MongoClient } = require('mongodb');

exports.online = function (client) {
  console.log('C.I.A.R.A. is online.');
  client.user.setActivity('My Creator', {
    type: 'LISTENING',
  });
};

exports.welcomeMember = function (member, client) {
  const channel = member.guild.systemChannel;
  const welcomeEmbed = new Discord.MessageEmbed({
    title: `${client.user.username} welcomes you!`,
    description: `Hey ${member}, welcome to **${channel.guild}**!\n\nTo find out all I can do type: \n\`${client.commandPrefix} help\`\n`,
    thumbnail: {
      url: member.user.displayAvatarURL(),
    },
    timestamp: new Date(),
    footer: {
      iconURL: client.user.displayAvatarURL(),
      text: 'Ciara',
    },
  });
  channel.send(welcomeEmbed);

  const guildSettings = client.provider.settings.get(member.guild.id);
  if (guildSettings.defaultRole) {
    const role = member.guild.roles.cache.find(
      (r) => r.toString() === guildSettings.defaultRole
    );
    member.roles
      .add(role)
      .then(() =>
        console.log(
          `'${member.user.username}' joined and was given the '${role.name}' role.`
        )
      )
      .catch((err) => console.error(err));
  }
};

exports.messageSent = async function (msg, client) {
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
      await msg.reply(
        `Congratulations! You've sent **${
          userLevelDoc.totalMessages + 1
        }** messages in ${
          msg.guild.name
        } and as a result have been **promoted to level ${
          userLevelDoc.level + 1
        }.**`
      );
    }

    await serverLevelsCollection.updateOne(filter, {
      $inc: updateQuery,
      $set: {
        lastupdate: new Date(),
      },
    });
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
