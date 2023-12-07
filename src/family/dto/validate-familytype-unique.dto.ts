import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FamilyTypeUiqueValidateDto {
  @IsNotEmpty()
  @IsOptional()
  userId: any;

  @IsNotEmpty()
  @IsString()
  familyType: string;
}
