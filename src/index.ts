import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { commands } from './commands';
import { events } from './events';
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

for (const event of events) {
  if (event.runOnce) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(client.EnvValueProvider.fetchBotToken());
