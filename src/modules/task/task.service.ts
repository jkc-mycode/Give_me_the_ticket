import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Repository } from 'typeorm';
import { ShowsService } from '../shows/shows.service';
import { SearchService } from '../shows/search/search.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private readonly searchService: SearchService,
    private readonly showService: ShowsService,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>
  ) {}

  // 매 분마다 실행되어 쇼 데이터를 동기화
  @Cron(CronExpression.EVERY_MINUTE, { name: 'syncAllShows' })
  async syncAllShowsCron() {
    await this.searchService.syncAllShows();
  }

  // 매 시간마다 실행되어 쇼 랭킹을 업데이트
  @Cron(CronExpression.EVERY_HOUR, { name: 'hourlyRankingUpdate' })
  async HourlyRankingUpdate() {
    await this.showService.HourlyRankingUpdate();
  }

  // 10분마다 실행되어 공연의 조회수를 업데이트
  @Cron('*/10 * * * *')
  async increaseShowViewCount() {
    await this.showService.increaseShowViewCount();
  }

  // 3시간마다 실행되어 만료된 티켓을 업데이트
  @Cron('* * 3 * * *')
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
