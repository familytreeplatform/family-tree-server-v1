import { IsNotEmpty, IsString } from 'class-validator';

export class QueryFamiliesDto {
  @IsNotEmpty()
  @IsString()
  familyName: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  tribe: string;
}
