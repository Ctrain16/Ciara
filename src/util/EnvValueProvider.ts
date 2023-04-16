export default class EnvValueProvider {
  private isDevEnvironment: boolean;
  private botToken: string;
  private botClientId: string;

  constructor(forceProdEnv = false) {
    if (!process.env.NODE_ENV) require('dotenv').config();
    this.isDevEnvironment =
      !forceProdEnv && process.env.NODE_ENV !== 'production';
    this.botToken = this.fetchBotToken();
    this.botClientId = this.fetchBotClientId();
  }

  fetchBotToken(): string {
    const botToken = this.isDevEnvironment
      ? process.env.CIARA_DEV_TOKEN
      : process.env.CIARA_TOKEN;

    if (typeof botToken !== 'string') {
      throw new Error(
        `${
          this.isDevEnvironment ? 'CIARA_DEV_TOKEN' : 'CIARA_TOKEN'
        } is not set properly. Should be of type string. Recieving type "${typeof botToken}"`
      );
    }
    return botToken;
  }

  fetchBotClientId(): string {
    const botClientId = this.isDevEnvironment
      ? process.env.CIARA_DEV_DISCORD_ID
      : process.env.CIARA_DISCORD_ID;

    if (typeof botClientId !== 'string') {
      throw new Error(
        `${
          this.isDevEnvironment ? 'CIARA_DEV_DISCORD_ID' : 'CIARA_DISCORD_ID'
        } is not set properly. Should be of type string. Recieving type "${typeof botClientId}"`
      );
    }
    return botClientId;
  }

  getBotToken(): string {
    return this.botToken;
  }

  getBotClientId(): string {
    return this.botClientId;
  }
}
