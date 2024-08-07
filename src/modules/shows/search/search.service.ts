import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Cron } from '@nestjs/schedule';
import { Show } from 'src/entities/shows/show.entity';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';

@Injectable()
export class SearchService {
  private readonly indexName = 'shows';

  constructor(
    private readonly eService: ElasticsearchService,
    @InjectRepository(Show) private readonly showRepository: Repository<Show>
  ) {}

  // 모듈이 초기화 될 때 인덱스 생성
  async onModuleInit() {
    await this.createIndex();
  }

  // Elasticsearch 인덱스 생성
  private async createIndex() {
    try {
      const indexExists = await this.eService.indices.exists({ index: this.indexName });

      if (!indexExists.body) {
        await this.eService.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  autocomplete_analyzer: {
                    tokenizer: 'autocomplete',
                    filter: ['lowercase'],
                  },
                  autocomplete_search_analyzer: {
                    tokenizer: 'keyword',
                    filter: ['lowercase'],
                  },
                },
                tokenizer: {
                  autocomplete: {
                    type: 'edge_ngram',
                    min_gram: 1,
                    max_gram: 30,
                    token_chars: ['letter', 'digit', 'whitespace'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                title: {
                  type: 'text',
                  fields: {
                    complete: {
                      type: 'text',
                      analyzer: 'autocomplete_analyzer',
                      search_analyzer: 'autocomplete_search_analyzer',
                    },
                  },
                },
                id: { type: 'long' },
                category: { type: 'keyword' },
                location: { type: 'text' },
                imageUrl: { type: 'text' },
              },
            },
          },
        });
      }
    } catch (error) {
      console.error('인덱스 생성 오류:', error);
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  // show 데이터 인덱싱
  public async indexShowData(show: Show) {
    try {
      const showData = await this.showRepository.findOne({
        where: { id: show.id },
        relations: { images: true },
      });

      if (!showData) {
        throw new InternalServerErrorException('Show not found');
      }

      await this.eService.index({
        index: this.indexName,
        id: showData.id.toString(),
        body: {
          id: showData.id,
          title: showData.title,
          category: showData.category,
          location: showData.location,
          imageUrl: showData.images.map((image) => image.imageUrl),
        },
      });
    } catch (error) {
      console.error('인덱싱 오류:', error);
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  // //전체 show 동기화
  // private async syncAllShows() {
  //   try {
  //     const allShows = await this.showRepository.find();

  //     if (allShows.length > 0) {
  //       await Promise.all(allShows.map((show) => this.indexShowData(show)));
  //       console.log(`${allShows.length}개의 쇼 동기화 완료`);
  //     } else {
  //       console.log('동기화할 쇼 없음');
  //     }
  //   } catch (error) {
  //     console.error('동기화 오류:', error);
  //     throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
  //   }
  // }

  //show 동기화 (스케줄링)
  private async syncAllShows() {
    try {
      const indexTime = new Date(Date.now() - 5 * 60 * 1000);

      const updatedShows = await this.showRepository.find({
        where: { updatedAt: MoreThan(indexTime) },
      });

      if (updatedShows.length > 0) {
        await Promise.all(updatedShows.map((show) => this.indexShowData(show)));
      }
    } catch (error) {
      console.error('동기화 오류:', error);
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  @Cron('*/5 * * * *') //5분마다 동기화
  async handleCron() {
    await this.syncAllShows();
  }

  // show 생성 시 인덱스에 추가
  async createShowIndex(show: Show) {
    await this.indexShowData(show);
  }

  // show 검색 기능
  async searchShows(category: string, search: string, page: number, limit: number) {
    const mustQueries = [];

    if (category) {
      mustQueries.push({ match: { category } });
    }

    if (search) {
      mustQueries.push({
        match: {
          title: {
            query: search,
            fuzziness: 'AUTO',
            minimum_should_match: '55%',
          },
        },
      });
    }

    const queryBody = {
      query: { bool: { must: mustQueries } },
      from: (page - 1) * limit,
      size: limit,
      sort: [{ id: { order: 'desc' } }],
    };

    try {
      const result = await this.eService.search({
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
    } catch (error) {
      console.error('검색 오류:', error);
      return { results: [], total: 0 };
    }
  }

  // show 삭제 시 인덱스에서 삭제
  async deleteShowIndex(showId: number) {
    try {
      await this.eService.delete({
        index: this.indexName,
        id: showId.toString(),
      });
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.DELETE.FAIL);
    }
  }
}
