import { IsNotEmpty, IsString } from 'class-validator';

export class SearchFamilyDto {
  @IsNotEmpty()
  @IsString()
  searchText: string;
}
