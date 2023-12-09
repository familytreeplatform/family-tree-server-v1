import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FamilyRelationshipsEnum, FamilyTypeEnum } from '../types';

export class JoinFamilyDto {
  @IsNotEmpty()
  @IsString()
  familyId: any;

  @IsNotEmpty()
  @IsEnum(FamilyTypeEnum, {
    message: `family type valid options are ${Object.values(FamilyTypeEnum)}`,
  })
  familyType: FamilyTypeEnum;

  @IsOptional()
  @IsString()
  user: any;

  @IsNotEmpty()
  @IsEnum(FamilyRelationshipsEnum, {
    message: `relationship to root valid options are ${Object.values(
      FamilyRelationshipsEnum,
    )}`,
  })
  relationshipToRoot: FamilyRelationshipsEnum;
}
