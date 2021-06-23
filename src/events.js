const Discord = require('discord.js');

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
