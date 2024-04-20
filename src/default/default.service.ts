import { Injectable, Logger } from '@nestjs/common';
import { DospacesService } from 'src/dospaces/dospaces.service';
import { UpdateUserGlobalSettings } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IResponse } from 'src/interfaces';
import { GlobalSettings, GlobalSettingsDocument } from './schemas';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class DefaultService {
  private readonly logger = new Logger(DefaultService.name);
  constructor(
    private readonly doSpacesService: DospacesService,
    @InjectModel(GlobalSettings.name)
    private globalSettingsModel: Model<GlobalSettingsDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folderName?: string,
  ): Promise<string> {
    // return await this.doSpacesService.uploadFile(file, `${folderName + 's'}`);
    return await this.cloudinary.upload(file)
  }

  async updateGlobalSettings(dto: UpdateUserGlobalSettings) {
    try {
      const updates = await this.globalSettingsModel.findOneAndUpdate(
        { user: dto.userId },
        { $set: dto.settingFields },
        { new: true },
      );

      console.log(updates);

      if (updates) {
        return <IResponse>{
          statusCode: 200,
          message: `settings successfully updated`,
          data: null,
          error: null,
        };
      }
    } catch (err) {
      console.error(`Error updating user settings ` + err);

      return <IResponse>{
        statusCode: 400,
        message: `settings failed to update`,
        data: null,
        error: {
          code: 'global_settings_update_failed',
          message:
            `an unexpected error occurred while processing the request: error ` +
            JSON.stringify(err, null, 2),
        },
      };
    }
  }
}
