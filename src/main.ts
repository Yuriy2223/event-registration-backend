import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const originsURL = process.env.FRONTEND_URL || process.env.DEV_URL;
  const port = process.env.BACKEND_PORT || process.env.DEV_PORT;

  app.enableCors({
    origin: originsURL,
    // credentials: true,
  });

  app.setGlobalPrefix('api');

  if (!port) {
    throw new Error('PORT must be defined in environment variables');
  }

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Error starting server', err);
  process.exit(1);
});
