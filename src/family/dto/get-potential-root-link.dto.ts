import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FamilyRelationshipsEnum } from '../types';

export class LinkToRootDto {
  @IsNotEmpty()
  @IsString()
  familyId: any;

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
