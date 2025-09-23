import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { EventModule } from '../src/event/event.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Server } from 'http';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  const getServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(uri),
        EventModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('/api (GET)', () => {
    it('should return "Hello World!"', () => {
      return request(getServer())
        .get('/api')
        .expect(200)
        .expect('Hello World!');
    });

    it('should have correct content type', () => {
      return request(getServer())
        .get('/api')
        .expect(200)
        .expect('Content-Type', /text\/html/);
    });
  });

  describe('Health check', () => {
    it('should be accessible', () => {
      return request(getServer()).get('/api').expect(200);
    });

    it('should respond quickly', async () => {
      const start = Date.now();
      await request(getServer()).get('/api').expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(getServer()).get('/api/non-existent-route').expect(404);
    });

    it('should handle wrong HTTP methods', () => {
      return request(getServer()).post('/api').expect(404);
    });

    it('should handle wrong HTTP methods - PUT', () => {
      return request(getServer()).put('/api').expect(404);
    });

    it('should handle wrong HTTP methods - DELETE', () => {
      return request(getServer()).delete('/api').expect(404);
    });

    it('should handle wrong HTTP methods - PATCH', () => {
      return request(getServer()).patch('/api').expect(404);
    });
  });

  describe('Application startup', () => {
    it('should initialize properly', () => {
      expect(app).toBeDefined();
    });

    it('should have global prefix set', async () => {
      await request(getServer()).get('/').expect(404);
    });
  });
});
