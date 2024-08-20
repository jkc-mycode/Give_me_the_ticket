import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(@InjectRepository(Ticket) private ticketRepository: Repository<Ticket>) {}

  @Cron('* * 5 * * *', { name: 'cronTask' })
  handleCron() {
    this.logger.log('Task Called!');
  }

  @Cron('* * * * * *') // 매 초마다 실행
  async updateExpiredTicket() {
    const nowTime = new Date();

    const tickets = await this.ticketRepository.find({
      where: { status: TicketStatus.USEABLE },
    });

    // 각 티켓을 확인하여 만료된 티켓을 업데이트
    for (const ticket of tickets) {
      const showTime = new Date(`${ticket.date}T${ticket.time}.000Z`);

      if (nowTime > showTime) {
        ticket.status = TicketStatus.EXPIRED;
        await this.ticketRepository.save(ticket);
      }
    }
  }
}
