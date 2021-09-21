if (!process.env.NODE_ENV) require('dotenv').config();
const path = require('path');
const { MongoClient } = require('mongodb');
const { MongoDBProvider } = require('commando-provider-mongo');
const Commando = require('discord.js-commando');
const { online, messageSent, welcomeMember } = require('./events');

const client = new Commando.Client({
  owner: process.env.MY_DISCORD_ID,
  commandPrefix: 'c ',
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.registry
  .registerGroups([
    ['music', 'Music'],
    ['serverxp', 'Server XP'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
  MongoClient.connect(process.env.MONGO_CONNECTION, {
    useUnifiedTopology: true,
  })
    .then(
      (client) =>
        new MongoDBProvider(
          client,
          process.env.NODE_ENV === 'development'
            ? 'ciaraDevDb'
            : 'ciaraDataBase'
        )
    )
    .catch((err) => {
      console.error(err);
    })
);

client.dispatcher.addInhibitor((msg) => {
  const musicChannel = client.provider.get(msg.guild.id, 'musicChannelId');
  if (msg.channel.id === musicChannel) return 'block';
});

client
  .on('ready', () => online(client))
  .on('guildMemberAdd', (member) => welcomeMember(member, client))
  .on('message', async (msg) => {
    if (msg.author.bot) return;

    const musicChannel = client.provider.get(msg.guild.id, 'musicChannelId');
    if (musicChannel && musicChannel === msg.channel.id) {
      msg.delete();
      client.registry.commands
        .get('play')
        .run(msg, { song: msg.content, isMusicChannel: true });

      return;
    }
    if (msg.isCommand) return;

    await messageSent(msg, client);
  })
  .on('messageReactionAdd', async (reaction, user) => {
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
  });

process.env.NODE_ENV === 'development'
  ? client.login(process.env.CIARA_DEV_TOKEN)
  : client.login(process.env.CIARA_TOKEN);
