import { Ping } from './util/ping';
import { SlashCommandBuilder } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: Function;
}

export const commands: Command[] = [Ping];
