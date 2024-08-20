import { Controller, Get, Post, Render } from '@nestjs/common';

@Controller('views/trades')
export class TradeViewsController {
  @Get('/list')
  @Render('trades/list.view.ejs')
  getTradeList() {}

  @Get(`/search`)
  @Render(`trades/trade-search.view.ejs`)
  searchTrade() {}

  @Get('/purchase/:tradeid')
  @Render(`trades/trade-purchase.view.ejs`)
  purchaseTrade() {}

  @Get()
  @Render('trades/trade-create.view.ejs')
  createTrade() {}

  @Get('/:tradeid')
  @Render('trades/detail.view.ejs')
  getTradeDetail() {}

  @Get('/:tradeId/edit')
  @Render('trades/trade-update.view.ejs')
  updateTrade() {}
}
