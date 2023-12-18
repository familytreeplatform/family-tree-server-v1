import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class UpdatePrimaryUserDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message:
      'Password must contain atleast one uppercase letter, one lowercase letter and a number',
  })
  password?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  family?: any;

  @IsOptional()
  @IsString()
  familyRootedTo?: any;
}
