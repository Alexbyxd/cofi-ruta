import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  const env = validateEnv();

  // `rawBody` keeps Nest's JSON parsing for DTOs while exposing the untouched
  // body that Better Auth's web handler needs.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(env.BACKEND_PORT);
  console.log(
    `🚀 CofiRutas Backend ejecutándose en http://localhost:${env.BACKEND_PORT}/api/v1`,
  );
}

void bootstrap();
