import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Trade } from '../../entities/trades/trade.entity';
import { TradeLog } from '../../entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, TradeLog, Show])],
  providers: [TradesService],
  controllers: [TradesController],
})
export class TradesModule {}
