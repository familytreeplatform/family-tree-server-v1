import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  testServerHealth(): string {
    this.logger.log(`PINGING family tree server for health check`);
    return `Hello from family tree server, lights are green and all systems are good to go`;
  }
}
