import { Module } from '@nestjs/common';
import { ShowreviewsService } from './show-reviews.service';
import { ShowreviewsController } from './show-reviews.controller';

@Module({
  controllers: [ShowreviewsController],
  providers: [ShowreviewsService],
})
export class ShowreviewsModule {}
