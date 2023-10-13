import { Provider } from '@nestjs/common';
import { Channel, Client } from 'discord.js';

export const DiscordClientProvider: Provider<{
  client: Client;
  channel: Channel;
}> = {
  provide: 'DiscordClient',
  useValue: { client: null, channel: null },
};
