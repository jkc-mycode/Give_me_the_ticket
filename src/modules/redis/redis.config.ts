import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MESSAGES } from 'src/commons/constants/trades/messages';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
    this.initialize();
  }

  private async initialize() {
    try {
      await this.redisClient.ping();
      console.log(MESSAGES.REDIS.SUCCESSFULLY_CONNECT);
    } catch (error) {
      console.error('Redis connection error:', error);
    }
  }

  getClient(): Redis {
    return this.redisClient;
  }
}

// // redis.config.ts
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import Redis from 'ioredis';

// @Injectable()
// export class RedisConfig {
//   private static redisClient: Redis;

//   constructor(private configService: ConfigService) {
//     if (!RedisConfig.redisClient) {
//       RedisConfig.redisClient = new Redis({
//         host: this.configService.get<string>('REDIS_HOST'),
//         port: this.configService.get<number>('REDIS_PORT'),
//         password: this.configService.get<string>('REDIS_PASSWORD'),
//         enableReadyCheck: true,
//       });
//       this.initialize();
//     }
//   }

//   private async initialize() {
//     try {
//       await RedisConfig.redisClient.ping();
//       console.log('Redis successfully connected');
//     } catch (error) {
//       console.error('Redis connection error:', error);
//     }
//   }

//   getClient(): Redis {
//     return RedisConfig.redisClient;
//   }
// }
