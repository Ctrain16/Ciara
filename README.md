<p align="center">
  <img src="images/CiaraLogo.jpg" width="200">
</p>

# C.I.A.R.A.

Cal's Intelligent And Responsive Automaton is my custom discord bot that is built using Node.js (previously Python).

## Functionality

Ciara's functionality will expand over time. Currently she supports the following:

- Music
- Leveling system based on message count
- Welcome messages
- Giving new users a role

## Hosting

I originally hosted the bot on my own raspberry pi but have since moved it over to an AWS EC2 server.

## Discord.js

Discord.js is a Discord API wrapper I utilized.

The documentation can be found [here](https://discord.js.org/#/).

## Scripts

### Deploy commands

Script to register slash commands. More info [here](https://discordjs.guide/creating-your-bot/command-deployment.html#command-registration)

Usage: `npm run reloadcommands` (:dev) option is for development server.

### Delete commands

Script to delete slash commands. More info [here](https://discordjs.guide/slash-commands/deleting-commands.html#deleting-specific-commands)

Usage: `npm run deletecommand {commandId}`

### Deploy Pi

Simple quality of life script for me to make updating the bot on my bot easier.
