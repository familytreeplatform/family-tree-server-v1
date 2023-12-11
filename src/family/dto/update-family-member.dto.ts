import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { FamilyRelationshipsEnum } from '../types';

export class UpdateFamilyMemberDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  familyId: string;

  @ValidateIf(
    (o) =>
      !o.newParentRelationship && !o.newParentFullName && !o.newParentGender,
  )
  @IsNotEmpty()
  @IsString()
  parentId: string;

  @ValidateIf((o) => !o.parentId)
  @IsEnum(FamilyRelationshipsEnum, {
    message: `relationship to root valid options are ${Object.values(
      FamilyRelationshipsEnum,
    )}`,
  })
  @IsString()
  newParentRelationshipToRoot: FamilyRelationshipsEnum;

  @ValidateIf((o) => !o.parentId)
  @IsNotEmpty()
  @IsString()
  newParentFullName: string;

  @ValidateIf((o) => !o.parentId)
  @IsNotEmpty()
  @IsString()
  newParentGender: string;

  @ValidateIf((o) => !o.parentId)
  @IsOptional()
  @IsDate()
  newParentDob: Date;
}
