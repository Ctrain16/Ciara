import { Coinflip } from './fun/coinflip';
import { EightBall } from './fun/eightball';
import { Trivia } from './fun/trivia';
import { Help } from './util/help';
import { Ping } from './util/ping';
import { SlashCommandBuilder } from 'discord.js';

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: Function;
}

export interface CommandCategory {
  name: string;
  commands: Command[];
}

export const commandCategories: CommandCategory[] = [
  {
    name: 'Fun',
    commands: [Coinflip, EightBall, Trivia],
  },
  {
    name: 'Util',
    commands: [Help, Ping],
  },
];

export const commands: Command[] = [Ping, Coinflip, EightBall, Trivia, Help];
