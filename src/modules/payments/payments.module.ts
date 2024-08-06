import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users/user.entity';
import { PointLog } from 'src/entities/users/point-log.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PointLog, Ticket]), HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
