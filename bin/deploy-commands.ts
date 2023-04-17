import { REST, Routes } from 'discord.js';
import { commands } from '../src/commands';
import EnvValueProvider from '../src/util/EnvValueProvider';

const isProdEnv: boolean = process.argv[2] === 'prod';
const envValueProvider = new EnvValueProvider(isProdEnv);

const commandsJson = commands.map((command) => command.data.toJSON());

const rest = new REST().setToken(envValueProvider.getBotToken());

(async () => {
  try {
    console.log(
      `Started refreshing ${commandsJson.length} application (/) globally (include DM's).`
    );

    const data: any = await rest.put(
      Routes.applicationCommands(envValueProvider.getBotClientId()),
      { body: commandsJson }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
