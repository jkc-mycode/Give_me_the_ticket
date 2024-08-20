import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { BatchController } from './batch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/entities/shows/ticket.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Ticket])],
  providers: [TaskService],
  controllers: [BatchController],
})
export class TaskModule {}
