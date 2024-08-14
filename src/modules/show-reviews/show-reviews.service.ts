import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShowReviewDto } from './dto/create-show-review.dto';
import { UpdateShowReviewDto } from './dto/update-show-review.dto';
import { User } from 'src/entities/users/user.entity';
import { ShowReview } from 'src/entities/show-reviews/show-reviews.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ticket } from 'src/entities/shows/ticket.entity';
import { SHOW_REVIEWS_MESSAGES } from 'src/commons/constants/show-reviews/show-reviews-message.constant';

@Injectable()
export class ShowReviewsService {
  constructor(
    @InjectRepository(ShowReview) private showReviewRepository: Repository<ShowReview>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>
  ) {}

  //공연 리뷰 생성 api
  async createShowReview(createShowReviewDto: CreateShowReviewDto, ticketId: number, user: User) {
    const { rate, postscript } = createShowReviewDto;

    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException(SHOW_REVIEWS_MESSAGES.COMMON.SHOW.TICKET.NOT_FOUND);
    }

    if (ticket.userId !== user.id) {
      throw new ForbiddenException(SHOW_REVIEWS_MESSAGES.COMMON.SHOW.TICKET.NOT_OWNER);
    }

    const showReview = this.showReviewRepository.create({
      userId: user.id,
      showId: ticket.showId,
      ticketId,
      rate,
      postscript,
      nickname: user.nickname,
    });
    await this.showReviewRepository.save(showReview);

    return showReview;
  }

  //공연별 리뷰 조회 목록 api
  async getShowReviewList(showId: number, page: number = 1): Promise<any> {
    //최신 순으로 정렬 및 페이지네이션 구현
    const take = 5;
    const [showReviews, totalShowReviews] = await this.showReviewRepository.findAndCount({
      where: { showId },
      order: { createdAt: 'DESC' },
      take,
      skip: (page - 1) * take,
    });

    return {
      data: showReviews,
      totalShowReviews,
      page,
      totalPages: Math.ceil(totalShowReviews / take),
    };
  }

  async updateShowReview(
    reviewId: number,

    updateShowReviewDto: UpdateShowReviewDto,
    user: User
  ) {
    const { rate, postscript } = updateShowReviewDto;
    const showReview = await this.showReviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!showReview) {
      throw new NotFoundException(SHOW_REVIEWS_MESSAGES.COMMON.SHOW.NOT_FOUND.UPDATE);
    }

    // 본인의 리뷰만 수정할 수 있게 합니다.
    if (showReview.userId !== user.id) {
      throw new ForbiddenException(SHOW_REVIEWS_MESSAGES.COMMON.FORBIDDEN.UPDATE);
    }

    const updateShowReview = this.showReviewRepository.save({
      ...showReview,
      rate,
      postscript,
    });

    return updateShowReview;
  }

  async deleteShowReview(reviewId: number, user: User) {
    const showReview = await this.showReviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!showReview) {
      throw new NotFoundException(SHOW_REVIEWS_MESSAGES.COMMON.SHOW.NOT_FOUND.DELETE);
    }

    // 이미 삭제된 리뷰시 에러 메시지 발생
    if (showReview.deletedAt) {
      throw new ConflictException(SHOW_REVIEWS_MESSAGES.COMMON.ALREADY_DELETED);
    }
    // 본인의 리뷰만 삭제할 수 있게 합니다.
    if (showReview.userId !== user.id) {
      throw new ForbiddenException(SHOW_REVIEWS_MESSAGES.COMMON.FORBIDDEN.DELETE);
    }
    // 리뷰 삭제
    showReview.deletedAt = new Date();
    return await this.showReviewRepository.save(showReview);
  }
}
