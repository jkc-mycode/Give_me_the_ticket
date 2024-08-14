import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShowReviewDto } from './dto/create-show-review.dto';
import { UpdateShowReviewDto } from './dto/update-show-review.dto';
import { User } from 'src/entities/users/user.entity';
import { ShowReview } from 'src/entities/show-reviews/show-reviews.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Show } from 'src/entities/shows/show.entity';

@Injectable()
export class ShowReviewsService {
  constructor(
    @InjectRepository(ShowReview) private showReviewRepository: Repository<ShowReview>,
    @InjectRepository(Show) private showRepository: Repository<Show>
  ) {}
  async createShowReview(createShowReviewDto: CreateShowReviewDto, showId: number, user: User) {
    const { totalRate, postscript } = createShowReviewDto;

    const show = await this.showRepository.findOne({
      where: { id: showId },
    });
    if (!show) {
      throw new NotFoundException('리뷰를 작성할 공연을 찾을 수 없습니다');
    }

    const showReview = this.showReviewRepository.create({
      userId: user.id,
      showId: show.id,
      totalRate,
      postscript,
      nickname: user.nickname,
    });
    await this.showReviewRepository.save(showReview);

    return showReview;
  }

  findAll() {
    return `This action returns all showreviews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} showreview`;
  }

  update(id: number, updateShowreviewDto: UpdateShowReviewDto) {
    return `This action updates a #${id} showreview`;
  }

  remove(id: number) {
    return `This action removes a #${id} showreview`;
  }
}
