import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import Redlock from 'redlock';
import { RedisConfig } from './redis.config';
import { REDIS_LOCK } from 'src/commons/constants/redis-lock.constant';

@Injectable()
export class RedisService {
  private readonly redlock: Redlock;
  private readonly lockDuration = REDIS_LOCK.DURATION;
  private readonly redisClient: Redis;
  constructor(
    // Redis 클라이언트를 주입받음
    private readonly redisConfig: RedisConfig
  ) {
    this.redisClient = this.redisConfig.getClient();
    this.redlock = new Redlock([this.redisClient], {
      retryCount: REDIS_LOCK.RETRY_COUNT, // 재시도 횟수
      retryDelay: REDIS_LOCK.RETRY_DELAY, // 재시도 지연시간
    });
  }

  //락 획득
  async acquireLock() {
    return this.redlock.acquire([REDIS_LOCK.TICKET], this.lockDuration);
  }
}
