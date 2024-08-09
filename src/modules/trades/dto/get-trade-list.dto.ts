import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { MIN_SHOW_SEARCH_LENGTH } from 'src/commons/constants/shows/shows.constant';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';

export class GetTradeListDto {
  /**
   * 페이지 번호
   * @example 1
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: Number;

  /**
   * 페이지당 게시물 갯수
   * @example 10
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: Number;
}
