import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  InteractionResponse,
} from 'discord.js';
import { Command } from '..';

export const Ping: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(`Checks the bot's ping to the Discord server.`),
  async execute(
    interaction: ChatInputCommandInteraction,
    createdTimestamp: number
  ) {
    const pingMsg: InteractionResponse = await interaction.reply(`Pinging`);
    const editedTimestamp = Date.now();
    const roundTripTime = editedTimestamp - createdTimestamp;

    await pingMsg.edit(
      `Pong! The message round-trip took ${roundTripTime}ms. ${
        interaction.client.ws.ping
          ? `The heartbeat ping is ${Math.round(interaction.client.ws.ping)}ms.`
          : ''
      }`
    );
  },
};
