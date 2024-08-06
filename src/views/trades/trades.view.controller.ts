import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/trades')
export class TradeViewsController {
  @Get('/detail')
  @Render('trades/detail-view.ejs')
  getTradeDetail() {}

  @Get('/list')
  @Render('trades/list.view.ejs')
  getTradeList() {}
}
