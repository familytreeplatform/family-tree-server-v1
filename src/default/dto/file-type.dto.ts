import { IsEnum, IsNotEmpty } from 'class-validator';
import { FileFolders } from './file-folder.enum';

export class UploadFileTypeDto {
  @IsNotEmpty()
  @IsEnum(FileFolders)
  folder: string;
}
