import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedocModule, RedocOptions } from 'nestjs-redoc';

async function bootstrap() {
  const configService = new ConfigService();
  const logger = new Logger(
    bootstrap.name.charAt(0).toUpperCase() + bootstrap.name.slice(1),
  );
  const app = await NestFactory.create(AppModule);
  // app.useWebSocketAdapter(new WsAdapter(app));

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

  const options = new DocumentBuilder()
    .setTitle('Family Tree API Documentation')
    .setDescription('API Documentation for the family tree social network')
    .setBasePath('/api/v1')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  const redocOptions: RedocOptions = {
    // title: 'Hello Nest',
    logo: {
      url: 'https://familytreeapp-bucket.nyc3.cdn.digitaloceanspaces.com/logos/FamilyTree%20Logo%20(Final).png',
      backgroundColor: '#F0F0F0',
      altText: 'familia app logo',
    },
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false,
    // auth: {
    //   enabled: true,
    //   user: 'admin',
    //   password: '123',
    // },
    tagGroups: [
      {
        name: 'Core resources',
        tags: ['cats'],
      },
    ],
  };
  // Instead of using SwaggerModule.setup() you call this module
  await RedocModule.setup('/docs', app as any, document, redocOptions);

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
