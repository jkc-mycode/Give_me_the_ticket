import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUES } from 'src/commons/constants/queue.constant';
import { SearchModule } from './search/search.module';

//entities
import { Trade } from '../../entities/trades/trade.entity';
import { TradeLog } from '../../entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { User } from 'src/entities/users/user.entity';
import { Image } from 'src/entities/images/image.entity';
import { PointLog } from 'src/entities/users/point-log.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SearchModule,
    TypeOrmModule.forFeature([
      Trade,
      TradeLog,
      Show,
      Schedule,
      Ticket,
      User,
      TradeLog,
      Image,
      PointLog,
    ]),
    RedisModule,
  ],
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TypeOrmModule],
})
export class TradesModule {}
