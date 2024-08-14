import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ShowReview } from 'src/entities/show-reviews/show-reviews.entity';
export class UpdateShowReviewDto extends PickType(ShowReview, ['totalRate', 'postscript']) {
  @Min(1)
  @Max(5, { message: '평점은 최대 5점까지 입력이 가능합니다.' })
  totalRate: number;

  postscript: string;
}
