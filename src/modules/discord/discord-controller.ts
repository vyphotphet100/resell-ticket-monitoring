import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
  forwardRef,
} from '@nestjs/common';
import { Channel, Client, TextChannel } from 'discord.js';
import { format } from 'date-fns';
import { StaticCache } from 'src/app.module';

@Controller('discord')
export class DiscordController {
  constructor(
    @Inject('DiscordClient')
    private discordClient: { client: Client; channel: Channel },
  ) {}

  async onBuild() {
    try {
      const channel = this.discordClient.channel;
      if (!channel) {
        Logger.error('[Resell Ticket Monitoring Bot]: Cannot get channel');
        return;
      }

      let buildLock = StaticCache.cache['BUILD_LOCK'];
      if (
        buildLock &&
        buildLock.value === true &&
        Math.floor(
          ((new Date().getTime() - buildLock.createdAt.getTime()) %
            (1000 * 60 * 60)) /
            (1000 * 60),
        ) < 3
      ) {
        (channel as TextChannel).send('Rejected.');
        return;
      }

      StaticCache.cache['BUILD_LOCK'] = {
        value: true,
        createdAt: new Date(),
      };

      //   await this.jenkinsController.triggerBuildOnJenkins();
      const moment = new Date();
      moment.setHours(moment.getHours() + 7);
      (channel as TextChannel).send(
        `- [${format(
          moment,
          'HH:mm dd/MM/yyyy',
        )}] Dev-server is starting to build now... It will be done around 3 mins.`,
      );
      return true;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }

  @Get('/send-success-message')
  async sendSuccessMessage() {
    try {
      const channel = this.discordClient.channel;
      if (!channel) {
        Logger.error('[Resell Ticket Monitoring Bot]: Cannot get channel');
        return false;
      }

      StaticCache.cache['BUILD_LOCK'] = {
        value: false,
        createdAt: new Date(),
      };
      const moment = new Date();
      moment.setHours(moment.getHours() + 7);
      (channel as TextChannel).send(
        `- [${format(moment, 'HH:mm dd/MM/yyyy')}] Build successfully!`,
      );
      return true;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }

  @Get('/send-message')
  async sendMessage(@Query('message') message: string) {
    try {
      const channel = this.discordClient.channel;
      if (!channel) {
        Logger.error('[Resell Ticket Monitoring Bot]: Cannot get channel');
        return false;
      }

      const moment = new Date();
      moment.setHours(moment.getHours() + 7);
      (channel as TextChannel).send(
        `- [${format(moment, 'HH:mm dd/MM/yyyy')}] ${message}`,
      );
      return true;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }

  @Post('/send-build-message')
  async devSendDiscordMessage(@Body() data: any) {
    try {
      const channel = this.discordClient.channel;
      if (!channel) {
        Logger.error('[Resell Ticket Monitoring Bot]: Cannot get channel');
        return;
      }

      const moment = new Date();
      moment.setHours(moment.getHours() + 7);
      let messageText = `- [${format(moment, 'HH:mm dd/MM/yyyy')}] **${
        data.user_name
      }** has just commited to '${
        data.ref
      }' branch with message: **${data.commits
        .map((commit) => commit.title)
        .join(
          ', ',
        )}**. Dev-server is starting to build now. The details of commit: **${
        data.commits[0].url
      }**`;

      (channel as TextChannel).send(messageText);
      return true;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }

  @Get('/test')
  async test(a: any) {
    console.log(a.b);
  }
}
