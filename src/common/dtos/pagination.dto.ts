import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  offset?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;
}
