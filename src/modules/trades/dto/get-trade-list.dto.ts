import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class GetTradeListDto {
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
