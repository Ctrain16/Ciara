import { REST, Routes } from 'discord.js';
import EnvValueProvider from '../src/util/EnvValueProvider';

const guildId = process.argv[2];
const isProdEnv: boolean = process.argv[3] === 'prod';
const commandId = process.argv[4];

const envValueProvider = new EnvValueProvider(isProdEnv);

const rest = new REST().setToken(envValueProvider.getBotToken());

(async () => {
  try {
    console.log(
      `Attempting to delete application commandId ${commandId} in guildId: ${guildId}`
    );

    const data: any = await rest.delete(
      Routes.applicationGuildCommand(
        envValueProvider.getBotClientId(),
        guildId,
        commandId
      )
    );

    console.log(
      `Successfully deleted application commandId ${commandId} in guildId: ${guildId}`
    );
  } catch (error) {
    console.error(error);
  }
})();
