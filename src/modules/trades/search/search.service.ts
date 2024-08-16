import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Trade } from 'src/entities/trades/trade.entity';
import { MESSAGES } from 'src/commons/constants/trades/messages';
import { Show } from 'src/entities/shows/show.entity';
import { Cron } from '@nestjs/schedule';

//삭제 예정
import { LifecycleExpiration } from '@aws-sdk/client-s3';
import { match } from 'assert';
import { query } from 'express';

@Injectable()
export class SearchService {
  private readonly indexName: string = 'trades';

  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    private readonly esService: ElasticsearchService
  ) {}

  async onModuleInit() {
    await this.createIndex();
  }

  private async createIndex() {
    try {
      const indexExists = await this.esService.indices.exists({ index: this.indexName });
      if (!indexExists.body) {
        await this.esService.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  my_ngram_analyzer: {
                    tokenizer: 'my_ngram_tokenizer',
                    filter: ['lowercase'],
                  },
                },
                tokenizer: {
                  my_ngram_tokenizer: {
                    type: 'ngram',
                    token_chars: ['letter', 'digit'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                title: {
                  type: 'text',
                  analyzer: 'my_ngram_analyzer',
                },
                id: { type: 'long' },
                showName: { type: 'text' },
              },
            },
          },
        });
      }
    } catch (err) {
      console.error('인덱스 생성 오류', err);
      throw new InternalServerErrorException(MESSAGES.TRADES.FAILED.CREATE_INDEX);
    }
  }

  public async indexTradeData(trade: Trade) {
    try {
      const originData = await this.tradeRepository.findOne({
        where: { id: trade.id },
      });
      const showData = await this.showRepository.findOne({
        where: { id: trade.showId },
      });
      const tradeData = { ...originData, show: { ...showData } };

      await this.esService.index({
        index: this.indexName,
        id: tradeData.id.toString(),
        body: {
          id: tradeData.id,
          title: tradeData.show.title,
        },
      });
    } catch (err) {
      console.error(err, '인덱싱 오류');
    }
  }

  private async syncAllTrades() {
    try {
      const indexTime = new Date(Date.now() - 5 * 60 * 1000);

      const updatedTrades = await this.tradeRepository.find({
        where: { updatedAt: MoreThan(indexTime) },
      });

      if (updatedTrades.length > 0) {
        await Promise.all(updatedTrades.map((trade) => this.indexTradeData(trade)));
      }
    } catch (err) {
      console.error(`동기화 오류: `, err);
      throw new InternalServerErrorException('중고 거래 데이터 인덱싱에 실패했습니다.');
    }
  }

  // @Cron('*/5 * * * *') //5분마다 동기화
  // async handleCron() {
  //   await this.SyncAllTrades();
  // }

  //trade 생성 시 인덱스에 추가
  async createTradeIndex(trade: Trade) {
    await this.indexTradeData(trade);
  }

  //trade 삭제 시 인덱스에서 삭제
  async deleteTradeIndex(tradeId: number) {
    try {
      await this.esService.delete({
        index: this.indexName,
        id: tradeId.toString(),
      });
    } catch (err) {
      console.error('인덱스 삭제 실패: ', err);
      throw new InternalServerErrorException('공연 삭제 실패했습니다');
    }
  }

  async searchTrades(search: string) {
    const mustQueries = [];

    if (search) {
      mustQueries.push({
        match: {
          title: {
            query: search,
            fuzziness: 'AUTO',
            minimum_should_match: 2,
          },
        },
      });
    }

    const queryBody = {
      query: { bool: { must: mustQueries } },
      sort: [{ id: { order: 'desc' } }],
    };

    try {
      const result = await this.esService.search({
        index: this.indexName,
        body: queryBody,
      });
      const hits = result.body.hits.hits;
      const results = hits.map((item) => item._source);
      const totalHits =
        typeof result.body.hits.total === 'number'
          ? result.body.hits.total
          : result.body.hits.total.value;
      return { results, total: totalHits };
    } catch (err) {
      console.error('검색오류:', err);
      return { results: [], total: 0 };
    }
  }
}
