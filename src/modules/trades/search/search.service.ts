import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade } from 'src/entities/trades/trade.entity';
import { MESSAGES } from 'src/commons/constants/trades/messages';

//삭제 예정
import { LifecycleExpiration } from '@aws-sdk/client-s3';

@Injectable()
export class SearchService {
  private readonly indexName: string = 'trades';

  constructor(
    @InjectRepository(Trade)
    private readonly tradeRepository: Repository<Trade>,
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
      const tradeData = await this.tradeRepository.findOne({
        where: { id: trade.id },
      });

      await this.esService.index({
        index: this.indexName,
        id: tradeData.id.toString(),
        body: {
          id: tradeData.id,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }
}
