import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/reviews')
export class ShowReviewsViewsController {
  @Get('/:ticketId')
  @Render('show-reviews/show-reviews.view.ejs')
  showReviews() {}
}
