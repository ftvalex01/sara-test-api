// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as csurf from 'csurf';
import helmet from "helmet";
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule,  { cors: true });

  app.use(helmet());
  app.use(csurf());

  await app.listen(3000);
}
bootstrap();
