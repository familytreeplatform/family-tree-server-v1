import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString,  } from 'class-validator';
import { ObjectId } from 'mongoose';

export class MemberSearchDto {
  @IsNotEmpty()
  @Transform(({value}) => value as ObjectId)
  familyId: ObjectId;

  @IsString()
  search: string;
}
