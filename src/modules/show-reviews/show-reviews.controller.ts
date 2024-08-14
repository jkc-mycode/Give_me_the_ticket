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
} from '@nestjs/common';
import { ShowReviewsService } from './show-reviews.service';
import { CreateShowReviewDto } from './dto/create-show-review.dto';
import { UpdateShowReviewDto } from './dto/update-show-review.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/utils/roles.decorator';
import { RolesGuard } from '../auth/utils/roles.guard';
import { Role } from 'src/commons/types/users/user-role.type';

@ApiTags('공연 리뷰')
@Controller('shows/reviews')
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
  @Post('/:showId')
  async createShowReview(
    @Param('showId') showId: number,
    @Body() createShowreviewDto: CreateShowReviewDto,
    @Req() req: any
  ) {
    const showReview = await this.showReviewsService.createShowReview(
      createShowreviewDto,
      showId,
      req.user
    );
    return { status: HttpStatus.CREATED, message: '리뷰 작성에 성공했습니다', data: showReview };
  }

  @Get()
  findAll() {
    return this.showReviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showReviewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShowreviewDto: UpdateShowReviewDto) {
    return this.showReviewsService.update(+id, updateShowreviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.showReviewsService.remove(+id);
  }
}
