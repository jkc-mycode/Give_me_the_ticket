import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { MESSAGES } from 'src/commons/constants/trades/messages';

export class GetTradeListDto {
  /**
   * 검색 키워드
   * @example `들려`
   */
  @IsOptional()
  @MinLength(2, { message: MESSAGES.TRADES.MIN_LENGTH.SEARCH_KEYWORD })
  @IsString()
  search?: string;

  /**
   * 페이지 번호
   * @example 1
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /**
   * 페이지당 게시물 갯수
   * @example 10
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
