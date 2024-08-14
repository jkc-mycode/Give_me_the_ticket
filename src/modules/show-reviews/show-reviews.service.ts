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
import { Show } from 'src/entities/shows/show.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';

@Injectable()
export class ShowReviewsService {
  constructor(
    @InjectRepository(ShowReview) private showReviewRepository: Repository<ShowReview>,
    @InjectRepository(Show) private showRepository: Repository<Show>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>
  ) {}

  //공연 리뷰 생성 api
  async createShowReview(createShowReviewDto: CreateShowReviewDto, ticketId: number, user: User) {
    const { rate, postscript } = createShowReviewDto;

    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException('리뷰를 작성할 공연을 찾을 수 없습니다');
    }

    // 본인의 리뷰만 수정할 수 있게 합니다.
    if (ticket.userId !== user.id) {
      throw new ForbiddenException('이 리뷰를 수정할 권한이 없습니다');
    }

    const showReview = this.showReviewRepository.create({
      userId: user.id,
      showId: ticket.showId,

      rate,
      postscript,
      nickname: user.nickname,
    });
    await this.showReviewRepository.save(showReview);

    return showReview;
  }

  //공연별 리뷰 조회 목록 api
  async findShowReviewList(showId: number) {
    //최신 순으로 정렬
    const showReviews = await this.showReviewRepository.find({
      where: { showId },
      order: { createdAt: 'DESC' },
    });
    if (!showReviews) {
      throw new NotFoundException('리뷰를 조회할 공연이 존재하지 않습니다');
    }

    return showReviews;
  }

  async updateShowReview(
    reviewId: number,
    showId: number,
    updateShowReviewDto: UpdateShowReviewDto,
    user: User
  ) {
    const { rate, postscript } = updateShowReviewDto;
    const showReview = await this.showReviewRepository.findOne({
      where: { id: reviewId, showId },
    });
    if (!showReview) {
      throw new NotFoundException('수정할 리뷰가 존재하지 않습니다');
    }

    // 본인의 리뷰만 수정할 수 있게 합니다.
    if (showReview.userId !== user.id) {
      throw new ForbiddenException('이 리뷰를 수정할 권한이 없습니다');
    }

    const updateShowReview = this.showReviewRepository.save({
      ...showReview,
      rate,
      postscript,
    });

    return updateShowReview;
  }

  async deleteShowReview(reviewId: number, showId: number, user: User) {
    const showReview = await this.showReviewRepository.findOne({
      where: { id: reviewId, showId },
    });
    if (!showReview) {
      throw new NotFoundException('삭제할 리뷰가 존재하지 않습니다');
    }

    // 이미 삭제된 리뷰시 에러 메시지 발생
    if (showReview.deletedAt) {
      throw new ConflictException('이미 삭제된 리뷰입니다');
    }
    // 본인의 리뷰만 삭제할 수 있게 합니다.
    if (showReview.userId !== user.id) {
      throw new ForbiddenException('이 리뷰를 삭제할 권한이 없습니다');
    }
    // 리뷰 삭제
    showReview.deletedAt = new Date();
    return await this.showReviewRepository.save(showReview);
  }
}
