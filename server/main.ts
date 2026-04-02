import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { __express as hbs } from 'hbs';
import { AppModule } from './app.module';
import { runMigration } from './database/migrate';

async function bootstrap() {
  console.log('[ENV CHECK]', Object.keys(process.env).join(', '));
  await runMigration();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: '*' });
  const dist = join(process.cwd(), 'dist', 'client');
  app.useStaticAssets(dist);
  app.setBaseViewsDir(dist);
  app.setViewEngine('html');
  app.engine('html', hbs);
  const port = Number(process.env.SERVER_PORT || 3000);
  const host = process.env.SERVER_HOST || '0.0.0.0';
  await app.listen(port, host);
  new Logger('Bootstrap').log(`Server running on http://${host}:${port}`);
}
bootstrap();
