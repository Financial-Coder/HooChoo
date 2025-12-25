import { IsOptional, IsString } from 'class-validator';

export class QueryCommentsDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}
