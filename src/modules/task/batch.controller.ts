import { Controller, Post } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Controller('batches')
export class BatchController {
  // 컨트롤러에도 ScheduleRegistry 를 주입받음
  constructor(private scheduler: SchedulerRegistry) {}

  @Post('/start')
  start() {
    // SchedulerRegistry 에 등록된 크론 잡 가져옴
    const job = this.scheduler.getCronJob('cronSample');

    // 크론 잡 실행
    job.start();

    console.log('start!! ', job.lastDate());
  }

  @Post('/stop')
  stop() {
    // SchedulerRegistry 에 등록된 크론 잡 가져옴
    const job = this.scheduler.getCronJob('cronSample');

    // 크론 잡 실행
    job.stop();

    console.log('stop!! ', job.lastDate());
  }
}
