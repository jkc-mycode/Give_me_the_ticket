import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';
import { RedisConfig } from './redis.config';
import { QUEUES } from 'src/commons/constants/queue.constant';

@Injectable()
export class RedisService {
  private readonly redlock: Redlock;
  private readonly lockDuration = 1000;
  private readonly redisClient: Redis;
  constructor(
    // Redis 클라이언트를 주입받음
    private readonly redisConfig: RedisConfig
  ) {
    this.redisClient = this.redisConfig.getClient();
    this.redlock = new Redlock([this.redisClient], {
      retryCount: 10, // 재시도 횟수
      retryDelay: 200, // 재시도 지연시간
    });
  }

  //락 획득
  async acquireLock() {
    return this.redlock.acquire([QUEUES.TICKET_LOCK], this.lockDuration);
  }
}
