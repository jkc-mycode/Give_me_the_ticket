import { Module } from '@nestjs/common';
import { ShowReviewsService } from './show-reviews.service';
import { ShowReviewsController } from './show-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users/user.entity';
import { ShowReview } from 'src/entities/show-reviews/show-reviews.entity';
import { Show } from 'src/entities/shows/show.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ShowReview, Show])],
  controllers: [ShowReviewsController],
  providers: [ShowReviewsService],
  exports: [ShowReviewsService],
})
export class ShowReviewsModule {}
