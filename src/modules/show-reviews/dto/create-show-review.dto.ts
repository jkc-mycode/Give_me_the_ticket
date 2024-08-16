import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ShowReview } from 'src/entities/show-reviews/show-reviews.entity';

export class CreateShowReviewDto extends PickType(ShowReview, ['rate', 'postscript']) {
  @IsNumber()
  @Min(1)
  @Max(5, { message: '평점은 최대 5점까지 입력이 가능합니다.' })
  @IsNotEmpty({ message: '평점을 입력해 주세요' })
  rate: number;

  @IsString()
  @MinLength(1)
  @MaxLength(1000, { message: '리뷰는 최대 1000점까지 입력이 가능합니다.' })
  @IsNotEmpty({ message: '리뷰를 입력해 주세요' })
  postscript: string;
}
