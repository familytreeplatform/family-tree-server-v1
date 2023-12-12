import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const configService = new ConfigService();
  const logger = new Logger(
    bootstrap.name.charAt(0).toUpperCase() + bootstrap.name.slice(1),
  );
  const app = await NestFactory.create(AppModule);

  Sentry.init({
    dsn: configService.get<string>('SENTRY_DSN'),
    tracesSampleRate: 1.0,
  });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('familia/api/v1');

  const port = configService.get<string>('PORT') || 4400;
  await app.listen(port, () => {
    logger.log(
      `family tree server serving on port: [${port}] in ${configService.get(
        'NODE_ENV',
      )} mode...`,
    );
  });
}
bootstrap();
