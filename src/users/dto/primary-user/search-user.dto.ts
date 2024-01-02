import { IsNotEmpty, IsString } from 'class-validator';

export class searchUserDto {
  @IsNotEmpty()
  @IsString()
  searchText: string;
}
