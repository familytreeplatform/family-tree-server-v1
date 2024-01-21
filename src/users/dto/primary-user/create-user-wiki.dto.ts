import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrimaryUserWikiDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  wiki: string;
}
