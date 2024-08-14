import { Module } from '@nestjs/common';
import Redlock from 'redlock';
import { Redis } from 'ioredis';
import { RedisModule } from './redis.module'; // Redis 클라이언트가 정의된 모듈

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: 'REDLOCK',
      useFactory: (redisClient: Redis) => {
        return new Redlock([redisClient], {
          retryCount: 10,
          retryDelay: 200, // time in ms
          retryJitter: 200, // time in ms
        });
      },
      inject: ['REDIS_CLIENT'], // Redis 클라이언트를 주입
    },
  ],
  exports: ['REDLOCK'],
})
export class RedlockModule {}
