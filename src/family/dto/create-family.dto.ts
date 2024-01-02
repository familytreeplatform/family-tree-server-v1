import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  FamilyRelationshipsEnum,
  FamilyTypeEnum,
  zeroToFirstGenerationFamilyRelations,
} from '../types';

export class CreateFamilyDto {
  @IsOptional()
  @IsString()
  creator: string;

  // EXISTING ROOT DATA: Applicable For When Creating Family With An Existing User As Root
  @ValidateIf((o) => o.newRootFullName === undefined)
  @IsNotEmpty()
  @IsString()
  root: string;

  @IsNotEmpty()
  @IsString()
  familyName: string;

  @IsNotEmpty()
  @IsEnum(FamilyTypeEnum, {
    message: `family type valid options are ${Object.values(FamilyTypeEnum)}`,
  })
  familyType: FamilyTypeEnum;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  tribe: string;

  @IsNotEmpty()
  @IsString()
  familyBio: string;

  @IsNotEmpty()
  @IsString()
  familyCoverImageURL: string;

  @IsNotEmpty()
  @IsEnum(FamilyRelationshipsEnum, {
    message: `relationship to root valid options are ${Object.values(
      FamilyRelationshipsEnum,
    )}`,
  })
  relationshipToRoot: FamilyRelationshipsEnum;

  // NEW ROOT DATA: Applicable Only When creating Family With A New User Root
  @ValidateIf((o) => !o.root || o.root === undefined)
  @IsNotEmpty()
  @IsString()
  newRootFullName: string;

  // @ValidateIf((o) => !o.root || o.root === undefined)
  // @IsNotEmpty()
  // @IsString()
  // newRootProfileURL: string;

  @ValidateIf((o) => !o.root || o.root === undefined)
  @IsOptional()
  @IsString()
  newRootGender: string;

  @ValidateIf((o) => !o.root || o.root === undefined)
  @IsOptional()
  @IsString()
  newRootDob: string;

  // PARENT DATA: Applicable To Non-First Generational Family Creators
  @ValidateIf(
    (o) => !zeroToFirstGenerationFamilyRelations.includes(o.relationshipToRoot),
  )
  @IsNotEmpty()
  @IsEnum(FamilyRelationshipsEnum, {
    message: `relationship to root valid options are ${Object.values(
      FamilyRelationshipsEnum,
    )}`,
  })
  newParentRelationshipToRoot: FamilyRelationshipsEnum;

  @ValidateIf(
    (o) => !zeroToFirstGenerationFamilyRelations.includes(o.relationshipToRoot),
  )
  @IsNotEmpty()
  @IsString()
  newParentFullName: string;

  @ValidateIf(
    (o) => !zeroToFirstGenerationFamilyRelations.includes(o.relationshipToRoot),
  )
  @IsNotEmpty()
  @IsString()
  newParentProfileURL: string;

  @ValidateIf(
    (o) => !zeroToFirstGenerationFamilyRelations.includes(o.relationshipToRoot),
  )
  @IsOptional()
  @IsString()
  newParentGender: string;

  @ValidateIf(
    (o) => !zeroToFirstGenerationFamilyRelations.includes(o.relationshipToRoot),
  )
  @IsOptional()
  @IsDate()
  newParentDob: string;
}
