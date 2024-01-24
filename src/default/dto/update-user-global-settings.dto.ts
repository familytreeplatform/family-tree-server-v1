import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateUserGlobalSettings {
  @IsOptional()
  @IsString()
  userId: Types.ObjectId;

  @IsNotEmpty()
  @IsObject()
  settingFields: { [key: string]: any };
}
