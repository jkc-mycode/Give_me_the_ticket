import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/shows')
export class ShowsViewsController {
  //공연 목록 페이지
  @Get('/list')
  @Render('shows/shows-list.view.ejs')
  showList() {}

  //공연 검색 페이지
  @Get('/search')
  @Render('shows/shows-list.view.ejs')
  searchShows() {}

  //티켓 예매 페이지
  @Get('/:showId/ticket')
  @Render('shows/shows-ticket.view.ejs')
  createTicket() {}

  //티켓 환불 페이지
  @Get('/:showId/ticket/:ticketId')
  @Render('shows/shows-refund.view.ejs')
  refundTicket() {}

  //공연 상세조회 페이지
  @Get('/:showId')
  @Render('shows/shows-detail.view.ejs')
  showsDetail() {}

  //공연 생성 페이지
  @Get()
  @Render('shows/shows-create.view.ejs')
  createShow() {}
}
