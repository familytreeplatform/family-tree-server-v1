import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class searchUserDto {
  @IsNotEmpty()
  @IsString()
  searchText: string;

  @Transform(({ value }) => value as ObjectId)
  @IsOptional()
  @IsString()
  familyId: ObjectId;
}
