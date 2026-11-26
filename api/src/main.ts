import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { migrate } from './database/migrate';

async function bootstrap() {
  await migrate(process.env.DATABASE_URL ?? '');
  // Stripe signs the raw body of its webhooks, so it is kept.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();
