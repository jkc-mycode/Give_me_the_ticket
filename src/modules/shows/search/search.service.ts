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
      const { body: indexExists } = await this.eService.indices.exists({ index: this.indexName });

      if (!indexExists) {
        await this.eService.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                tokenizer: {
                  ngram_tokenizer: {
                    type: 'ngram',
                    token_chars: ['letter', 'digit', 'whitespace'],
                  },
                },
                analyzer: {
                  ngram_analyzer: {
                    type: 'custom',
                    tokenizer: 'ngram_tokenizer',
                    filter: ['lowercase'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                title: {
                  type: 'text',
                  analyzer: 'ngram_analyzer',
                  search_analyzer: 'ngram_analyzer',
                },
                category: { type: 'keyword' },
                id: { type: 'long' },
                imageUrl: { type: 'text' },
              },
            },
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  // show 데이터 인덱싱
  public async indexShowData(show: Show) {
    try {
      await this.eService.index({
        index: this.indexName,
        id: show.id.toString(),
        body: {
          id: show.id,
          title: show.title,
          category: show.category,
        },
      });
    } catch (error) {
      console.error('인덱싱 오류:', error);
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  // show 동기화 (스케줄링)
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
        query_string: {
          query: `*${search.replace(/ /g, '*')}*`,
          fields: ['title'],
          analyze_wildcard: true,
          fuzziness: 'AUTO',
        },
      });
    }

    const queryBody = {
      _source: ['id'],
      query: { bool: { must: mustQueries } },
      from: (page - 1) * limit,
      size: limit,
      sort: [{ id: { order: 'desc' } }],
    };

    try {
      const { body: result } = await this.eService.search({
        index: this.indexName,
        body: queryBody,
      });
      const hits = result.hits.hits;
      const ids = hits.map((item) => item._source.id);
      const totalHits =
        typeof result.hits.total === 'number' ? result.hits.total : result.hits.total.value;

      return { ids, total: totalHits };
    } catch (error) {
      console.error('검색 오류:', error);
      return { ids: [], total: 0 };
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
