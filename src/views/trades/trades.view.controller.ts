import { Controller, Get, Post, Render } from '@nestjs/common';

@Controller('views/trades')
export class TradeViewsController {
<<<<<<< HEAD
  @Get('/list')
=======
  @Get('/page')
>>>>>>> db73f2923d703a46af244d2ba40c6284c7e6aa99
  @Render('trades/list.view.ejs')
  getTradeList() {}

  @Get('/:tradeid')
  @Render('trades/detail.view.ejs')
  getTradeDetail() {}

  @Get('/purchase/:tradeid')
  @Render(`trades/trade-purchase.view.ejs`)
  purchaseTrade() {}

  @Get('/:tradeId/edit')
  @Render('trades/trade-update.view.ejs')
  updateTrade() {}

  @Get()
  @Render('trades/trade-create.view.ejs')
  createTrade() {}
}
