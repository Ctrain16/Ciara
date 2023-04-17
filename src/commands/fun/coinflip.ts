import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '..';

export const Coinflip: Command = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flips a coin.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(Math.random() < 0.5 ? 'Heads  😐' : 'Tails  🐒');
  },
};
