import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModuleValidationSchema } from 'src/configs/env-validation.config';
import { typeOrmModuleOptions } from 'src/configs/database.config';
import * as redisStore from 'cache-manager-redis-store';

//modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ShowsModule } from './modules/shows/shows.module';
import { TradesModule } from './modules/trades/trades.module';
import { ImagesModule } from './modules/images/images.module';
import { RedisModule } from './modules/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { SearchModule } from './modules/shows/search/search.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RedlockModule } from './modules/redis/redlock.module';
import { ShowReviewsModule } from './modules/show-reviews/show-reviews.module';
import { CacheModule } from '@nestjs/cache-manager';

//controllers
import { ViewsController } from './views/main/main.view.controller';
import { AuthViewsController } from './views/auth/auth.view.controller';
import { UsersViewsController } from './views/users/users.view.controller';
import { ShowsViewsController } from './views/shows/shows.view.controller';
import { TradeViewsController } from './views/trades/trades.view.controller';
import { ShowReviewsController } from './modules/show-reviews/show-reviews.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        password: configService.get<string>('REDIS_PASSWORD'),
        ttl: 60,
      }),
    }),

    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UsersModule,
    ShowsModule,
    TradesModule,
    ImagesModule,
    RedisModule,
    SearchModule,
    PaymentsModule,
    RedlockModule,
    ShowReviewsModule,
  ],
  controllers: [
    AppController,
    ViewsController,
    AuthViewsController,
    UsersViewsController,
    ShowsViewsController,
    TradeViewsController,
    ShowReviewsController,
  ],
  providers: [AppService],
})
export class AppModule {}
