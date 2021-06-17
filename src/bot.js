'use strict';
require('dotenv').config();
const path = require('path');
const { MongoClient } = require('mongodb');
const { MongoDBProvider } = require('commando-provider-mongo');
const Commando = require('discord.js-commando');
const Discord = require('discord.js');

const client = new Commando.Client({
  owner: process.env.MY_DISCORD_ID,
  commandPrefix: 'c ',
});

client.registry
  .registerGroups([
    ['music', 'Music'],
    ['fun', 'Fun'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
  MongoClient.connect(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  })
    .then((client) => new MongoDBProvider(client, 'ciaraDataBase'))
    .catch((err) => {
      console.error(err);
    })
);

client
  .on('ready', () => {
    console.log('C.I.A.R.A. is online.');
    client.user.setActivity('My Creator', {
      type: 'LISTENING',
    });
  })
  .on('disconnect', () => {
    console.log('Disconnected.');
  })
  .on('reconnecting', () => {
    console.log('Reconnecting.');
  })
  .on('guildMemberAdd', (member) => {
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
  })
  .on('message', (msg) => {});

client.login(process.env.CIARA_TOKEN);
