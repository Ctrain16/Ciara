import { REST, Routes } from 'discord.js';
import { commands } from '../src/commands';
import EnvValueProvider from '../src/util/EnvValueProvider';

const guildId = process.argv[2];
const isProdEnv: boolean = process.argv[3] === 'prod';
const envValueProvider = new EnvValueProvider(isProdEnv);

const commandsJson = commands.map((command) => command.data.toJSON());

const rest = new REST().setToken(envValueProvider.getBotToken());

(async () => {
  try {
    console.log(
      `Started refreshing ${commandsJson.length} application (/) commands in guildId: ${guildId}`
    );

    const data: any = await rest.put(
      Routes.applicationGuildCommands(
        envValueProvider.getBotClientId(),
        guildId
      ),
      { body: commandsJson }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
