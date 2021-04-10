'use strict';
require('dotenv').config();
const path = require('path');
const { MongoClient } = require('mongodb');
const { MongoDBProvider } = require('commando-provider-mongo');

const Commando = require('discord.js-commando');
const client = new Commando.Client({
  owner: '327627829221261312',
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
  });

client.login(process.env.CIARA_TOKEN);
