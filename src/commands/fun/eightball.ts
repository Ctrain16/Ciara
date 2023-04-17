import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '..';

const eightBallResponses: string[] = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes - definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  "Don't count on it.",
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.',
];

export const EightBall: Command = {
  data: new SlashCommandBuilder()
    .setName('eightball')
    .setDescription('Answers a yes or no question.')
    .addStringOption((option) =>
      option
        .setName('question')
        .setDescription('The yes or no question to ask the eightball.')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(
      eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)]
    );
  },
};
