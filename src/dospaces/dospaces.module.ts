import { Global, Module } from '@nestjs/common';
import { DoSpacesServiceProvider } from './dospaces.config';
import { DospacesService } from './dospaces.service';

@Global()
@Module({
  providers: [DospacesService, DoSpacesServiceProvider],
  exports: [DospacesService],
})
export class DospacesModule {}
