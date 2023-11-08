import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class DefaultSignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
