import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class PasswordResetDto {
  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and a number',
  })
  password: string;
}
