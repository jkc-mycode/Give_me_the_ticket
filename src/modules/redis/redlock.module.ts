import { Module } from '@nestjs/common';
import Redlock from 'redlock';
import { Redis } from 'ioredis';
import { RedisModule } from './redis.module'; // Redis 클라이언트가 정의된 모듈
import { REDIS_LOCK } from 'src/commons/constants/redis-lock.constant';

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: 'REDLOCK',
      useFactory: (redisClient: Redis) => {
        return new Redlock([redisClient], {
          retryCount: REDIS_LOCK.RETRY_COUNT,
          retryDelay: REDIS_LOCK.RETRY_DELAY, // time in ms
          retryJitter: REDIS_LOCK.RETRY_JITTER, // time in ms
        });
      },
      inject: ['REDIS_CLIENT'], // Redis 클라이언트를 주입
    },
  ],
  exports: ['REDLOCK'],
})
export class RedlockModule {}
