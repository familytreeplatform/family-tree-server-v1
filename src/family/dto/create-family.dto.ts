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
  topLevelFamilyRelations,
} from '../types';

export class CreateFamilyDto {
  @IsOptional()
  @IsString()
  creator: string;

  @ValidateIf(
    (o) => o.newRootUserName == undefined || o.newRootFullName === undefined,
  )
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
  @IsEnum(FamilyRelationshipsEnum, {
    message: `relationship to root valid options are ${Object.values(
      FamilyRelationshipsEnum,
    )}`,
  })
  relationshipToRoot: FamilyRelationshipsEnum;

  @ValidateIf((o) => !o.root || o.root === undefined)
  @IsNotEmpty()
  @IsString()
  newRootUserName: string;

  @ValidateIf((o) => !o.root || o.root === undefined)
  @IsNotEmpty()
  @IsString()
  newRootFullName: string;

  @ValidateIf((o) => !topLevelFamilyRelations.includes(o.relationshipToRoot))
  @IsNotEmpty()
  @IsString()
  newParentRelationship: string;

  @ValidateIf((o) => !topLevelFamilyRelations.includes(o.relationshipToRoot))
  @IsNotEmpty()
  @IsString()
  newParentFullName: string;

  @ValidateIf((o) => !topLevelFamilyRelations.includes(o.relationshipToRoot))
  @IsNotEmpty()
  @IsString()
  newParentGender: string;

  @ValidateIf((o) => !topLevelFamilyRelations.includes(o.relationshipToRoot))
  @IsOptional()
  @IsDate()
  newParentDob: string;

  familyCoverImage: Express.Multer.File;
}
