const Discord = require('discord.js');
const { updateUserLevel } = require('./levels');

const online = function (client) {
  console.log('C.I.A.R.A. is online.');
  client.user.setActivity('My Creator', {
    type: 'LISTENING',
  });
};

const welcomeMember = function (member, client) {
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

const messageSent = async function (msg, client) {
  const guildSettings = client.provider.settings.get(msg.guild.id);
  if (guildSettings.levelsEnabled) {
    await updateUserLevel(msg, client);
  }
};

const messageReaction = async function (reaction, user, client) {
  try {
    if (user === client.user) return;
    if (reaction.partial) await reaction.fetch();

    const embedId = client.provider.get(
      reaction.message.guild.id,
      'musicMessageId'
    );

    if (reaction.message.id !== embedId) return;

    if (reaction.emoji.name === '▶') {
      client.registry.commands
        .get('play')
        .run(reaction.message, { song: null, isMusicChannel: true });
    } else if (reaction.emoji.name === '⏸') {
      client.registry.commands
        .get('pause')
        .run(reaction.message, { isMusicChannel: true });
    } else if (reaction.emoji.name === '⏭') {
      client.registry.commands
        .get('skip')
        .run(reaction.message, { isMusicChannel: true });
    } else if (reaction.emoji.name === '⏹') {
      client.registry.commands
        .get('disconnect')
        .run(reaction.message, { isMusicChannel: true });
    }

    await reaction.users.remove(user);
  } catch (error) {
    console.error(`[ERROR]: ${error}`);
    return;
  }
};

module.exports = {
  online,
  messageSent,
  welcomeMember,
  messageReaction,
};
