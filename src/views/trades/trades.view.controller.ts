import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/trades')
export class TradeViewsController {
  @Get('/list')
  @Render('trades/list.view.ejs')
  getTradeList() {}

  @Get('/:tradeid')
  @Render('trades/detail.view.ejs')
  getTradeDetail() {}
}
