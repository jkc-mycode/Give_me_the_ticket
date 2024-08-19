import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SearchModule } from './search/search.module';
import { RedisModule } from '../redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';

import { Show } from 'src/entities/shows/show.entity';
import { User } from 'src/entities/users/user.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Image } from 'src/entities/images/image.entity';
import { PointLog } from 'src/entities/users/point-log.entity';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { ImagesService } from '../images/images.service';
import { ShowRanking } from 'src/entities/shows/showRanking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([
      Show,
      User,
      Ticket,
      Bookmark,
      Schedule,
      Image,
      PointLog,
      ShowRanking,
    ]),
    SearchModule,
    RedisModule,
    CacheModule.register(),
  ],
  controllers: [ShowsController],

  providers: [ShowsService, ImagesService],
  exports: [TypeOrmModule],
})
export class ShowsModule {}
