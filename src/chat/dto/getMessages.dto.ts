import { ObjectId } from 'mongoose';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMessagesDto {
  @ValidateIf((o) => !o.toId && !o.fromId)
  @Transform(({ value }) => value as ObjectId)
  @IsNotEmpty()
  conversationId: ObjectId;

  @ValidateIf((o) => o.toId)
  @Transform(({ value }) => value as ObjectId)
  @IsNotEmpty()
  fromId: ObjectId;

  @ValidateIf((o) => o.fromId)
  @Transform(({ value }) => value as ObjectId)
  @IsNotEmpty()
  toId: ObjectId;

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
