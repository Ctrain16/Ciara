import { Client, ActivityType, ClientEvents } from 'discord.js';
import { Ready } from './ready';
import { InteractionCreate } from './interaction-create';

export interface EventDefinition {
  name: keyof ClientEvents;
  runOnce: boolean;
  execute: Function;
}

export const events: EventDefinition[] = [Ready, InteractionCreate];
