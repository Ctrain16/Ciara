import { ClientEvents } from 'discord.js';
import { Ready } from './ready';
import { InteractionCreate } from './interaction-create';
import { GuildMemberAdd } from './guild-member-add';

export interface EventDefinition {
  name: keyof ClientEvents;
  runOnce: boolean;
  execute: Function;
}

export const events: EventDefinition[] = [
  Ready,
  InteractionCreate,
  GuildMemberAdd,
];
