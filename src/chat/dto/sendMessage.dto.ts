import { IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class MessageDto {
  @IsNotEmpty()
  toId: ObjectId;

  @IsNotEmpty()
  @IsString()
  message: string;
}
