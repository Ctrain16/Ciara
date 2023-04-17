import {
  Client,
  GatewayIntentBits,
  Events,
  ActivityType,
  Collection,
} from 'discord.js';
import { commands } from './commands';
import EnvValueProvider from './util/EnvValueProvider';

require('console-stamp')(console, {
  format: ':date(yyyy/mm/dd HH:MM:ss.l) :label',
});

declare module 'discord.js' {
  interface Client {
    EnvValueProvider: EnvValueProvider;
    commands: any;
  }
}

const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const envValueProvider = new EnvValueProvider();
client.EnvValueProvider = envValueProvider;

client.commands = new Collection();
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (c) => {
  console.log(`${c.user.tag} is online`);
  c.user.setActivity({
    name: 'some fire 🔥🔥🔥',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley',
    type: ActivityType.Streaming,
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  const interactionCreatedTimestamp = Date.now();
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, interactionCreatedTimestamp);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

client.login(client.EnvValueProvider.fetchBotToken());
