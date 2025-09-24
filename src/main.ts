import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const originsURL = process.env.FRONTEND_URL || process.env.DEV_URL;
  const port = process.env.BACKEND_PORT || process.env.DEV_PORT;

  app.enableCors({
    origin: originsURL,
    // credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Event Registration API')
    .setDescription('API for managing events and participant registration')
    .setVersion('1.0')
    .addTag('events', 'Event management')
    .addTag('participants', 'Participant registration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  if (!port) {
    throw new Error('PORT must be defined in environment variables');
  }

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Error starting server', err);
  process.exit(1);
});
