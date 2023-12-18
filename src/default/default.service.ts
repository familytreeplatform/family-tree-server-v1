import { Injectable, Logger } from '@nestjs/common';
import { DospacesService } from 'src/dospaces/dospaces.service';

@Injectable()
export class DefaultService {
  private readonly logger = new Logger(DefaultService.name);
  constructor(private readonly doSpacesService: DospacesService) {}

  async uploadFile(
    file: Express.Multer.File,
    folderName?: string,
  ): Promise<string> {
    return await this.doSpacesService.uploadFile(file, `${folderName + 's'}`);
  }
}
