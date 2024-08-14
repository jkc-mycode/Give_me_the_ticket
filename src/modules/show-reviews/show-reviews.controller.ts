import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ShowReviewsService } from './show-reviews.service';
import { CreateShowReviewDto } from './dto/create-show-review.dto';
import { UpdateShowReviewDto } from './dto/update-show-review.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/utils/roles.decorator';
import { RolesGuard } from '../auth/utils/roles.guard';
import { Role } from 'src/commons/types/users/user-role.type';
import { SHOW_REVIEWS_MESSAGES } from 'src/commons/constants/show-reviews/show-reviews-message.constant';

@ApiTags('공연 리뷰')
@Controller('reviews')
export class ShowReviewsController {
  constructor(private readonly showReviewsService: ShowReviewsService) {}

  /**
   * 공연 리뷰 작성
   * @param showId
   * @param createShowReviewDto
   * @param req
   * @returns
   * */
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/:ticketId')
  async createShowReview(
    @Param('ticketId') ticketId: number,
    @Body() createShowreviewDto: CreateShowReviewDto,
    @Req() req: any
  ) {
    const showReview = await this.showReviewsService.createShowReview(
      createShowreviewDto,
      ticketId,
      req.user
    );
    return { status: HttpStatus.CREATED, message: SHOW_REVIEWS_MESSAGES.CREATED, data: showReview };
  }

  //공연별 리뷰 조회
  @Get()
  async getShowReviewList(@Query('showId') showId: number, @Query('page') page: number = 1) {
    const showReviews = await this.showReviewsService.getShowReviewList(showId, page);
    return showReviews;
  }

  //공연 리뷰 수정
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('/:reviewId')
  async updateShowReview(
    @Param('reviewId') reviewId: number,
    @Body() updateShowreviewDto: UpdateShowReviewDto,
    @Req() req: any
  ) {
    const updateShowReview = await this.showReviewsService.updateShowReview(
      reviewId,
      updateShowreviewDto,
      req.user
    );
    return {
      status: HttpStatus.OK,
      message: SHOW_REVIEWS_MESSAGES.UPDATED,
      data: updateShowReview,
    };
  }

  //공연 리뷰 삭제
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('/:reviewId')
  async deleteShowReview(@Param('reviewId') reviewId: number, @Req() req: any) {
    await this.showReviewsService.deleteShowReview(reviewId, req.user);
    return {
      status: HttpStatus.OK,
      message: SHOW_REVIEWS_MESSAGES.DELETED,
    };
  }
}
