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

client.on('ready', () => {
  console.log('C.I.A.R.A. is online.');
});

client.on('message', (message) => {
  if (message.content === 'ping') {
    message.channel.send('pong');
  }
});

client.registry
  .registerGroups([
    ['music', 'Music'],
    ['fun', 'Fun'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(
  MongoClient.connect(
    `mongodb+srv://${process.env.MONGO_CONNECTION}@ciaradb.zmwci.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    { useUnifiedTopology: true }
  )
    .then((client) => new MongoDBProvider(client, 'ciaraDataBase'))
    .catch((err) => {
      console.error(err);
    })
);

client.login(process.env.CIARA_TOKEN);
