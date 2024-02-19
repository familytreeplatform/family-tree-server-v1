import { IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { FamilyRelationshipsEnum } from '../types';

export class AddMemberDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  @IsDateString()
  dob: string;

  @IsNotEmpty()
  @IsEnum(FamilyRelationshipsEnum, {
    message: `relationship to root valid options are ${Object.values(
      FamilyRelationshipsEnum,
    )}`,
  })
  relationshipToRoot: FamilyRelationshipsEnum;
}
