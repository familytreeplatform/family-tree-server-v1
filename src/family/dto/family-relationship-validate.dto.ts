import { IsNotEmpty, IsEnum } from 'class-validator';
import { FamilyRelationshipsEnum } from '../types';

export class FamilyRelationshipValidateDto {
  @IsNotEmpty()
  @IsEnum(FamilyRelationshipsEnum, {
    message: `relationship to root valid options are ${Object.values(
      FamilyRelationshipsEnum,
    )}`,
  })
  relationshipToRoot: FamilyRelationshipsEnum;
}
