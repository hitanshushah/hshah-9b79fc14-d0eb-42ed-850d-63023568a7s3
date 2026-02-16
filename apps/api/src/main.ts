import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

const port = Number(process.env.PORT) || 3011;
const globalPrefix = process.env.GLOBAL_PREFIX || 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
