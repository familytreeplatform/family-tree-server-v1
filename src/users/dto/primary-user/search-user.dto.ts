import { IsEmail, IsOptional, IsString } from 'class-validator';

export class searchUserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  userName: string;
}
