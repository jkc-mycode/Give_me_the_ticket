import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { SearchModule } from '../shows/search/search.module';

import { Ticket } from 'src/entities/shows/ticket.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { Image } from 'src/entities/images/image.entity';
import { ShowRanking } from 'src/entities/shows/show_ranking.entity';

import { BatchController } from './batch.controller';
import { TaskService } from './task.service';
import { ShowsService } from '../shows/shows.service';

import { ImagesService } from '../images/images.service';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SearchModule,
    RedisModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([Ticket, Show, Bookmark, Image, ShowRanking]),
  ],
  providers: [TaskService, ShowsService, ImagesService, RedisService],
  controllers: [BatchController],
})
export class TaskModule {}
