import { Coinflip } from './fun/coinflip';
import { EightBall } from './fun/eightball';
import { Ping } from './util/ping';
import { SlashCommandBuilder } from 'discord.js';

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: Function;
}

export const commands: Command[] = [Ping, Coinflip, EightBall];
