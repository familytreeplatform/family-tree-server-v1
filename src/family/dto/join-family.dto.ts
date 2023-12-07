import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class JoinFamilyDto {
  @IsNotEmpty()
  @IsString()
  familyId: any;

  @IsOptional()
  @IsString()
  user: any;

  @IsNotEmpty()
  @IsString()
  relationshipToRoot: string;
}
