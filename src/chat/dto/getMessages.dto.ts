import { ObjectId } from 'mongoose';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMessagesDto {
  @IsNotEmpty()
  @Transform(({ value }) => value as ObjectId)
  conversationId: ObjectId;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(0)
  pageNo = 0;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  @Min(1)
  pageSize = 10;
}
