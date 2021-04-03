'use strict'
require('dotenv').config();

const Discord = require('discord.js')
const client = new Discord.Client();

client.on('ready', () =>{
  console.log('C.I.A.R.A. is online.');
})

client.on('message', message =>{
  if(message.content === 'ping'){
    message.channel.send('pong')
  }
})

client.login(process.env.CIARA_TOKEN)