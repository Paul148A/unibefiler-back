import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'documentos-personales'), {
    prefix: '/documentos-personales/',
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'documentos-inscripcion'), {
    prefix: '/documentos-inscripcion/',
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'documentos-grado'), {
    prefix: '/documentos-grado/',
  });
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });
  await app.listen(3000);
}
bootstrap();
