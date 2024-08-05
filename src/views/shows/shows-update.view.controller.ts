import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/shows')
export class ShowsViewsController {
  //티켓 예매 페이지
  @Get('/:showId/ticket')
  @Render('shows/shows-ticket.view.ejs')
  createTicket() {}

  //공연 상세조회 페이지
  @Get('/:showId')
  @Render('shows/shows-detail.view.ejs')
  showsDetail() {}

  // 공연 수정 페이지
  @Get('/:showId/edit')
  @Render('shows/show-update.view.ejs')
  updateShow() {}
}
