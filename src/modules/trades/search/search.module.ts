import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from 'src/entities/trades/trade.entity';
import { SearchService } from './search.service';
//삭제 예정
import { LifecycleExpiration } from '@aws-sdk/client-s3';
import { Show } from 'src/entities/shows/show.entity';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTIC_NODE'),
        maxRetries: configService.get<number>('ELASTIC_MAX_RETRIES'),
        requestTimeout: configService.get<number>('ELASTIC_REQUEST_TIMEOUT'),
        pingTimeout: configService.get<number>('ELASTIC_PING_TIMEOUT'),
        auth: {
          username: configService.get<string>('ELASTIC_USERNAME'),
          password: configService.get<string>('ELASTIC_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Trade, Show]),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
