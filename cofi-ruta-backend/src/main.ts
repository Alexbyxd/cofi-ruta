import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  const env = validateEnv();

  const app = await NestFactory.create(AppModule);

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
