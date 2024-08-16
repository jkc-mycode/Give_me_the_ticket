import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';
import { MESSAGES } from 'src/commons/constants/trades/messages';
import { GetTradeListDto } from './get-trade-list.dto';

export class TestDto extends PickType(GetTradeListDto, ['search']) {}
