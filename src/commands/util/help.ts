import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} from 'discord.js';
import { Command, CommandCategory, commandCategories } from '..';

export const Help: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription(
      'Displays a list of available commands, or detailed information for a specified command.'
    )
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Specific command to provide help for.')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const commandToHelpWith: string | null =
      interaction.options.getString('command');

    const helpMessage = commandToHelpWith
      ? createHelpMessageForCommand(commandToHelpWith)
      : createHelpMessage();

    if (interaction.channel?.type !== ChannelType.DM) {
      await interaction.user.send(helpMessage);
      await interaction.reply(
        `${interaction.user}, sent you a DM with information.`
      );
    } else {
      await interaction.reply(helpMessage);
    }
  },
};

function createHelpMessage(): string {
  let helpMessage: string = `__***Available Ciara Commands***__\n\n`;
  commandCategories.forEach((category: CommandCategory) => {
    helpMessage += `__**${category.name}**__\n`;
    category.commands.forEach((command: Command) => {
      helpMessage += `*${command.data.name}:* ${command.data.description}\n`;
    });
    helpMessage += `\n`;
  });
  return helpMessage;
}

function createHelpMessageForCommand(commandToHelpWith: string): string {
  let helpMessage = null;
  commandCategories.forEach((category: CommandCategory) => {
    category.commands.forEach((command: Command) => {
      if (command.data.name.toLowerCase() === commandToHelpWith.toLowerCase()) {
        helpMessage = `__Command **${command.data.name}:**__ ${command.data.description}\n\n**Command Category:** ${category.name}`;
      }
    });
  });
  return helpMessage === null
    ? `Sorry, the command \`${commandToHelpWith}\` does not exist.`
    : helpMessage;
}
