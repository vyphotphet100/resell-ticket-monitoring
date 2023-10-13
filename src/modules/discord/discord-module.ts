import { Inject, Logger, Module, forwardRef } from '@nestjs/common';
import { DiscordClientProvider } from './providers/discord-client.provider';
import { Channel, Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { DiscordController } from './discord-controller';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [],
  controllers: [DiscordController],
  providers: [DiscordClientProvider, DiscordController],
  exports: [DiscordController],
})
export class DiscordModule {
  private channelId = '1162250848525631500';

  constructor(
    @Inject('DiscordClient')
    private discordClient: { client: Client; channel: Channel },
    private readonly discordController: DiscordController,
  ) {
    this.setupDiscordClient();
  }

  async setupDiscordClient() {
    // Set up discord
    if (process.env.DISCORD_TOKEN) {
      this.discordClient.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      this.discordClient.client.once('ready', () => {
        Logger.log(
          `${this.discordClient.client.user.tag} connected successfully`,
        );
        this.discordClient.channel =
          this.discordClient.client.channels.cache.get(this.channelId);
      });

      await this.setupEvent();
      this.discordClient.client.login(process.env.DISCORD_TOKEN);
    }
  }

  async setupEvent() {
    this.discordClient.client.on('messageCreate', async (message) => {
      await this.setupEventMessageHandler(message);
    });
  }

  async setupEventMessageHandler(message) {
    const channel = this.discordClient.channel;
    if (!channel) {
      Logger.error('[Resell Ticket Monitoring Bot]: Cannot get channel');
      return;
    }

    if (message.content === '!build') {
      await this.discordController.onBuild();
    }
  }
}
