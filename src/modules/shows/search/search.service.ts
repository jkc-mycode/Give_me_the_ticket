import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
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
    //await this.syncAllShows();
  }

  //Elasticsearch 인덱스 생성
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
                category: { type: 'keyword' },
                location: { type: 'text' },
                imageUrl: { type: 'text' },
                views: { type: 'integer' },
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
        relations: ['images', 'schedules'],
      });

      await this.eService.index({
        index: this.indexName,
        id: showData.id.toString(),
        body: {
          id: showData.id,
          title: showData.title,
          category: showData.category,
          location: showData.location,
          imageUrl: showData.images.map((image) => image.imageUrl),
          showDate: showData.schedules.map((schedule) => schedule.date),
          views: showData.views,
        },
      });
    } catch (error) {
      console.error('인덱싱 오류:', error);
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  //전체 show 동기화
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
  public async syncAllShows() {
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

  // show 생성 시 인덱스에 추가
  async createShowIndex(show: Show) {
    await this.indexShowData(show);
  }

  // show 검색 기능
  async searchShows(category: string, search: string, page: number, limit: number, date: string) {
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
            minimum_should_match: 2,
          },
        },
      });
    }

    if (date) {
      mustQueries.push({ match: { 'schedules.date': date } });
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
