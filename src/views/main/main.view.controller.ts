import { Controller, Get, Render } from '@nestjs/common';

@Controller('views')
export class ViewsController {
  //공연 목록 페이지
  @Get('')
  @Render('main/main.view.ejs')
  showList() {}
}
