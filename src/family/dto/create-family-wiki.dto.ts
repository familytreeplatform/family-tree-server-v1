import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFamilyWikiDto {
  @IsNotEmpty()
  @IsString()
  familyId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  wiki: string;

  @IsOptional()
  @IsArray()
  editors: any[];
}
