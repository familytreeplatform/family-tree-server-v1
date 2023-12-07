import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DefaultSignInDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
