import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TradesService } from './trades.service';
import { update } from 'lodash';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { User } from 'src/entities/users/user.entity';
import { number } from 'joi';
import { TestDto } from './dto/test-dto';
import { MESSAGES } from 'src/commons/constants/trades/messages';

//constants
import { SWAGGER } from 'src/commons/constants/trades/swagger.constant';

//swagger
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiAcceptedResponse,
  ApiNoContentResponse,
  ApiMovedPermanentlyResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiMethodNotAllowedResponse,
  ApiNotAcceptableResponse,
  ApiRequestTimeoutResponse,
  ApiConflictResponse,
  ApiTooManyRequestsResponse,
  ApiGoneResponse,
  ApiPayloadTooLargeResponse,
  ApiUnsupportedMediaTypeResponse,
  ApiUnprocessableEntityResponse,
  ApiInternalServerErrorResponse,
  ApiNotImplementedResponse,
  ApiBadGatewayResponse,
  ApiServiceUnavailableResponse,
  ApiGatewayTimeoutResponse,
  ApiDefaultResponse,
} from '@nestjs/swagger';
import { Role } from 'src/commons/types/users/user-role.type';
import { RolesGuard } from '../auth/utils/roles.guard';
import { Roles } from '../auth/utils/roles.decorator';

@ApiTags(SWAGGER.TRADES.TRADES_API_TAGS)
@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  //테스트 메서드==============================
  @ApiBearerAuth()
  @Get('/hello')
  @ApiOperation({
    summary: SWAGGER.TRADES.HELLO.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.HELLO.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: 'hello를 출력합니다' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async hello(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.hello(user.id);
  }
  @ApiBearerAuth()
  @Get('/test')
  @ApiOperation({
    summary: SWAGGER.TRADES.TEST.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.TEST.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({
    description: '실행이 완료되면 bbbbbbbbbbbbbbbbbbbbbbbb를 출력합니다',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async test(@Body() testDto: TestDto) {
    console.log('AAAAAAAAAAAAAAAAA');
    return await this.tradesService.test();
  }

  @Get('/change-role')
  @ApiOperation({
    summary: SWAGGER.TRADES.CHANGE_ROLE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.CHANGE_ROLE.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @ApiNoContentResponse({ description: '유저의 계정이 변경됩니다' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async changeRole(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.changeRole(user.id);
  }

  @Get('/schedule/:scheduleId')
  @ApiOperation({
    summary: SWAGGER.TRADES.CHANGE_REMAIN_SEAT.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.CHANGE_REMAIN_SEAT.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async changRemainSeat(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return await this.tradesService.changRemainSeat(scheduleId);
  }

  //테스트 메서드========================================================

  //<1>중고 거래 로그 조회
  @ApiBearerAuth()
  @Get('tradelogs')
  @ApiOperation({
    summary: SWAGGER.TRADES.GET_TRADE_LOGS.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.GET_TRADE_LOGS.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @ApiNotFoundResponse({
    description: SWAGGER.TRADES.GET_TRADE_LOGS.API_NOT_FOUND_RESPONSE.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getLogs(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.getLogs(user.id);
  }

  //<2>중고 거래 목록 조회
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: SWAGGER.TRADES.GET_TRADE_LIST.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.GET_TRADE_LIST.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  async getList() {
    return await this.tradesService.getList();
  }

  //<3>중고 거래 생성
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: SWAGGER.TRADES.CREATE_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.CREATE_TRADE.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @ApiUnauthorizedResponse({
    description: SWAGGER.TRADES.CREATE_TRADE.API_UNAUTHORIZED_RESPONSE.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async createTrade(@Body() createTradeDto: CreateTradeDto, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTrade(createTradeDto, user.id);
  }

  //<4>중고 거래 상세 조회
  @ApiBearerAuth()
  @Get('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.GET_DETAILED_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.GET_DETAILED_TRADE.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @ApiUnauthorizedResponse({
    description: SWAGGER.TRADES.GET_DETAILED_TRADE.API_UNAUTHORIZED_RESPONSE.DESCRIPTION,
  })
  async getTradeDetail(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.getTradeDetail(tradeId);
  }
  //첫 주솟값을 param으로 받는 콘트롤러 메서드

  //<5>중고 거래 수정
  @ApiBearerAuth()
  @Patch('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.UPDATE_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.UPDATE_TRADE.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @ApiUnauthorizedResponse({
    description: SWAGGER.TRADES.UPDATE_TRADE.API_UNAUTHORIZED_RESPONSE.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async updateTrade(
    @Param('tradeId', ParseIntPipe) tradeId: number,
    @Body() updateTradeDto: UpdateTradeDto,
    @Req() req: { user: User }
  ) {
    const user = req.user;
    return await this.tradesService.updateTrade(tradeId, updateTradeDto, user.id);
  }

  //<6>중고 거래 삭제
  @ApiBearerAuth()
  @Delete('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.DELETE_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.DELETE_TRADE.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @ApiUnauthorizedResponse({
    description: SWAGGER.TRADES.DELETE_TRADE.API_UNAUTHORIZED_RESPONSE.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async deleteTrade(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    await this.tradesService.deleteTrade(tradeId, user.id);
    return { message: MESSAGES.TRADES.SUCCESSFULLY_DELETE.TRADE };
  }

  //<7>중고 거래 구매
  @ApiBearerAuth()
  @Post('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.PURCHASE_TICKET.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.PURCHASE_TICKET.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: '' })
  @ApiUnauthorizedResponse({
    description: SWAGGER.TRADES.PURCHASE_TICKET.API_UNAUTHORIZED_RESPONSE.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  async createTicket(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTicket(tradeId, user.id);
  }
}
