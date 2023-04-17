import { Events, Client, ActivityType } from 'discord.js';
import { EventDefinition } from '.';

export const Ready: EventDefinition = {
  name: Events.ClientReady,
  runOnce: true,
  execute: (client: Client) => {
    console.log(`${client.user!.tag} is online`);
    client.user!.setActivity({
      name: 'some fire 🔥🔥🔥',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley',
      type: ActivityType.Streaming,
    });
  },
};
