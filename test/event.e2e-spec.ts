import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from '../src/event/event.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Server } from 'http';
import { CreateEventDto } from '../src/event/dto/create-event.dto';
import { RegisterParticipantDto } from '../src/event/dto/register-participant.dto';

interface EventResponse extends CreateEventDto {
  _id: string;
}

interface ParticipantResponse extends RegisterParticipantDto {
  _id: string;
  eventId: string;
}

interface EventListResponse {
  events: EventResponse[];
  currentPage: number;
  totalPages: number;
  totalEvents: number;
}

interface ErrorResponse {
  message: string;
}

interface DeleteResponse {
  message: string;
  eventId: string;
}

describe('EventController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let connection: Connection;

  const getServer = (): Server => app.getHttpServer() as Server;

  const createTestEvent = (): CreateEventDto => ({
    imgUrl: 'https://example.com/image.jpg',
    title: 'Test Event',
    description: 'This is a test event description',
    eventDate: new Date('2025-12-31'),
    organizer: 'Test Organizer',
  });

  const createTestParticipant = (): RegisterParticipantDto => ({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    dob: new Date('1990-01-01'),
    referral: 'Social Media',
  });

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
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  beforeEach(async () => {
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
    await mongod.stop();
  });

  describe('/api/events (GET)', () => {
    it('should return empty events list initially', () => {
      return request(getServer())
        .get('/api/events')
        .expect(200)
        .expect((res) => {
          const body = res.body as EventListResponse;
          expect(body.events).toEqual([]);
          expect(body.currentPage).toBe(1);
          expect(body.totalPages).toBe(0);
          expect(body.totalEvents).toBe(0);
        });
    });

    it('should return events with pagination', async () => {
      const event1 = createTestEvent();
      const event2 = { ...createTestEvent(), title: 'Another Event' };

      await request(getServer()).post('/api/events').send(event1).expect(201);
      await request(getServer()).post('/api/events').send(event2).expect(201);

      return request(getServer())
        .get('/api/events?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          const body = res.body as EventListResponse;
          expect(body.events).toHaveLength(2);
          expect(body.currentPage).toBe(1);
          expect(body.totalEvents).toBe(2);
        });
    });

    it('should sort events properly', async () => {
      const event1 = { ...createTestEvent(), title: 'A Event' };
      const event2 = { ...createTestEvent(), title: 'Z Event' };

      await request(getServer()).post('/api/events').send(event1).expect(201);
      await request(getServer()).post('/api/events').send(event2).expect(201);

      const ascResponse = await request(getServer())
        .get('/api/events?sortField=title&sortOrder=asc')
        .expect(200);

      const ascBody = ascResponse.body as EventListResponse;
      expect(ascBody.events[0].title).toBe('A Event');
      expect(ascBody.events[1].title).toBe('Z Event');

      const descResponse = await request(getServer())
        .get('/api/events?sortField=title&sortOrder=desc')
        .expect(200);

      const descBody = descResponse.body as EventListResponse;
      expect(descBody.events[0].title).toBe('Z Event');
      expect(descBody.events[1].title).toBe('A Event');
    });

    it('should handle server errors gracefully', () => {
      return request(getServer()).get('/api/events').expect(200);
    });
  });

  describe('/api/events (POST)', () => {
    it('should create a new event successfully', () => {
      const eventData = createTestEvent();

      return request(getServer())
        .post('/api/events')
        .send(eventData)
        .expect(201)
        .expect((res) => {
          const body = res.body as EventResponse;
          expect(body.title).toBe(eventData.title);
          expect(body.description).toBe(eventData.description);
          expect(body.organizer).toBe(eventData.organizer);
          expect(body.imgUrl).toBe(eventData.imgUrl);
          expect(body._id).toBeDefined();
        });
    });

    it('should return 400 when required fields are missing', () => {
      return request(getServer())
        .post('/api/events')
        .send({ title: 'Test Event' })
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toBe('All fields are required.');
        });
    });

    it('should return 400 when imgUrl is missing', () => {
      const eventDataWithoutImgUrl: Omit<CreateEventDto, 'imgUrl'> = {
        title: 'Test Event',
        description: 'This is a test event description',
        eventDate: new Date('2025-12-31'),
        organizer: 'Test Organizer',
      };

      return request(getServer())
        .post('/api/events')
        .send(eventDataWithoutImgUrl)
        .expect(400);
    });

    it('should return 400 when title is missing', () => {
      const eventDataWithoutTitle: Omit<CreateEventDto, 'title'> = {
        imgUrl: 'https://example.com/image.jpg',
        description: 'This is a test event description',
        eventDate: new Date('2025-12-31'),
        organizer: 'Test Organizer',
      };

      return request(getServer())
        .post('/api/events')
        .send(eventDataWithoutTitle)
        .expect(400);
    });

    it('should return 400 when description is missing', () => {
      const eventDataWithoutDescription: Omit<CreateEventDto, 'description'> = {
        imgUrl: 'https://example.com/image.jpg',
        title: 'Test Event',
        eventDate: new Date('2025-12-31'),
        organizer: 'Test Organizer',
      };

      return request(getServer())
        .post('/api/events')
        .send(eventDataWithoutDescription)
        .expect(400);
    });

    it('should return 400 when eventDate is missing', () => {
      const eventDataWithoutEventDate: Omit<CreateEventDto, 'eventDate'> = {
        imgUrl: 'https://example.com/image.jpg',
        title: 'Test Event',
        description: 'This is a test event description',
        organizer: 'Test Organizer',
      };

      return request(getServer())
        .post('/api/events')
        .send(eventDataWithoutEventDate)
        .expect(400);
    });

    it('should return 400 when organizer is missing', () => {
      const eventDataWithoutOrganizer: Omit<CreateEventDto, 'organizer'> = {
        imgUrl: 'https://example.com/image.jpg',
        title: 'Test Event',
        description: 'This is a test event description',
        eventDate: new Date('2025-12-31'),
      };

      return request(getServer())
        .post('/api/events')
        .send(eventDataWithoutOrganizer)
        .expect(400);
    });
  });

  describe('/api/events/:eventId (GET)', () => {
    it('should return event by id', async () => {
      const eventData = createTestEvent();
      const createResponse = await request(getServer())
        .post('/api/events')
        .send(eventData)
        .expect(201);

      const createdEvent = createResponse.body as EventResponse;

      return request(getServer())
        .get(`/api/events/${createdEvent._id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as EventResponse;
          expect(body._id).toBe(createdEvent._id);
          expect(body.title).toBe(eventData.title);
        });
    });

    it('should return 404 when event not found', () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      return request(getServer())
        .get(`/api/events/${nonExistentId}`)
        .expect(404)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toBe('Event not found.');
        });
    });

    it('should return 404 for invalid event id format', () => {
      return request(getServer()).get('/api/events/invalid-id').expect(404);
    });
  });

  describe('/api/events/:eventId (PATCH)', () => {
    it('should update event successfully', async () => {
      const eventData = createTestEvent();
      const createResponse = await request(getServer())
        .post('/api/events')
        .send(eventData)
        .expect(201);

      const createdEvent = createResponse.body as EventResponse;
      const updateData = { title: 'Updated Event Title' };

      return request(getServer())
        .patch(`/api/events/${createdEvent._id}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          const body = res.body as EventResponse;
          expect(body.title).toBe(updateData.title);
          expect(body._id).toBe(createdEvent._id);
        });
    });

    it('should return 404 when updating non-existent event', () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Title' };

      return request(getServer())
        .patch(`/api/events/${nonExistentId}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 500 for invalid event id format', () => {
      return request(getServer())
        .patch('/api/events/invalid-id')
        .send({ title: 'Updated Title' })
        .expect(500);
    });
  });

  describe('/api/events/:eventId (DELETE)', () => {
    it('should delete event successfully', async () => {
      const eventData = createTestEvent();
      const createResponse = await request(getServer())
        .post('/api/events')
        .send(eventData)
        .expect(201);

      const createdEvent = createResponse.body as EventResponse;

      return request(getServer())
        .delete(`/api/events/${createdEvent._id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as DeleteResponse;
          expect(body.message).toBe('Event deleted successfully');
          expect(body.eventId).toBe(createdEvent._id);
        });
    });

    it('should return 404 when deleting non-existent event', () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      return request(getServer())
        .delete(`/api/events/${nonExistentId}`)
        .expect(404);
    });

    it('should return 500 for invalid event id format', () => {
      return request(getServer()).delete('/api/events/invalid-id').expect(500);
    });
  });

  describe('/api/events/:eventId/register (POST)', () => {
    let eventId: string;

    beforeEach(async () => {
      const eventData = createTestEvent();
      const createResponse = await request(getServer())
        .post('/api/events')
        .send(eventData)
        .expect(201);
      const createdEvent = createResponse.body as EventResponse;
      eventId = createdEvent._id;
    });

    it('should register participant successfully', () => {
      const participantData = createTestParticipant();

      return request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participantData)
        .expect(201)
        .expect((res) => {
          const body = res.body as ParticipantResponse;
          expect(body.fullName).toBe(participantData.fullName);
          expect(body.email).toBe(participantData.email);
          expect(body.referral).toBe(participantData.referral);
          expect(body.eventId).toBe(eventId);
          expect(body._id).toBeDefined();
        });
    });

    it('should return 400 when fullName is missing', () => {
      const participantDataWithoutFullName: Omit<
        RegisterParticipantDto,
        'fullName'
      > = {
        email: 'john.doe@example.com',
        dob: new Date('1990-01-01'),
        referral: 'Social Media',
      };

      return request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participantDataWithoutFullName)
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toBe(
            'Full name, email, and date of birth are required.',
          );
        });
    });

    it('should return 400 when email is missing', () => {
      const participantDataWithoutEmail: Omit<RegisterParticipantDto, 'email'> =
        {
          fullName: 'John Doe',
          dob: new Date('1990-01-01'),
          referral: 'Social Media',
        };

      return request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participantDataWithoutEmail)
        .expect(400);
    });

    it('should return 400 when dob is missing', () => {
      const participantDataWithoutDob: Omit<RegisterParticipantDto, 'dob'> = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        referral: 'Social Media',
      };

      return request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participantDataWithoutDob)
        .expect(400);
    });

    it('should return 400 for invalid email format', () => {
      const participantData = {
        ...createTestParticipant(),
        email: 'invalid-email',
      };

      return request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participantData)
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toBe('Invalid email format.');
        });
    });

    it('should return 400 when date of birth is in the future', () => {
      const participantData = {
        ...createTestParticipant(),
        dob: new Date('2030-01-01'),
      };

      return request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participantData)
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toBe('Date of birth cannot be in the future.');
        });
    });

    it('should return 500 for invalid event id format', () => {
      const participantData = createTestParticipant();

      return request(getServer())
        .post('/api/events/invalid-id/register')
        .send(participantData)
        .expect(500);
    });
  });

  describe('/api/events/:eventId/participants (GET)', () => {
    let eventId: string;
    let participant1: RegisterParticipantDto;
    let participant2: RegisterParticipantDto;

    beforeEach(async () => {
      const eventData = createTestEvent();
      const createResponse = await request(getServer())
        .post('/api/events')
        .send(eventData)
        .expect(201);
      const createdEvent = createResponse.body as EventResponse;
      eventId = createdEvent._id;

      participant1 = createTestParticipant();
      participant2 = {
        ...createTestParticipant(),
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
      };

      await request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participant1)
        .expect(201);

      await request(getServer())
        .post(`/api/events/${eventId}/register`)
        .send(participant2)
        .expect(201);
    });

    it('should return all participants for an event', () => {
      return request(getServer())
        .get(`/api/events/${eventId}/participants`)
        .expect(200)
        .expect((res) => {
          const participants = res.body as ParticipantResponse[];
          expect(participants).toHaveLength(2);
          expect(
            participants.some((p) => p.fullName === participant1.fullName),
          ).toBe(true);
          expect(
            participants.some((p) => p.fullName === participant2.fullName),
          ).toBe(true);
        });
    });

    it('should search participants by name', () => {
      return request(getServer())
        .get(`/api/events/${eventId}/participants?search=Jane`)
        .expect(200)
        .expect((res) => {
          const participants = res.body as ParticipantResponse[];
          expect(participants).toHaveLength(1);
          expect(participants[0].fullName).toBe(participant2.fullName);
        });
    });

    it('should search participants by email', () => {
      return request(getServer())
        .get(`/api/events/${eventId}/participants?search=john.doe`)
        .expect(200)
        .expect((res) => {
          const participants = res.body as ParticipantResponse[];
          expect(participants).toHaveLength(1);
          expect(participants[0].email).toBe(participant1.email);
        });
    });

    it('should return empty array when no participants match search', () => {
      return request(getServer())
        .get(`/api/events/${eventId}/participants?search=nonexistent`)
        .expect(200)
        .expect((res) => {
          const participants = res.body as ParticipantResponse[];
          expect(participants).toHaveLength(0);
        });
    });

    it('should return 400 for invalid event id format', () => {
      return request(getServer())
        .get('/api/events/invalid-id/participants')
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.message).toBe('Invalid eventId format');
        });
    });

    it('should return empty array for non-existent event with valid id', () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      return request(getServer())
        .get(`/api/events/${nonExistentId}/participants`)
        .expect(200)
        .expect((res) => {
          const participants = res.body as ParticipantResponse[];
          expect(participants).toHaveLength(0);
        });
    });
  });

  describe('Integration tests', () => {
    it('should handle complete event lifecycle', async () => {
      const eventData = createTestEvent();
      const createResponse = await request(getServer())
        .post('/api/events')
        .send(eventData)
        .expect(201);

      const createdEvent = createResponse.body as EventResponse;

      await request(getServer())
        .get(`/api/events/${createdEvent._id}`)
        .expect(200);

      const participantData = createTestParticipant();
      await request(getServer())
        .post(`/api/events/${createdEvent._id}/register`)
        .send(participantData)
        .expect(201);

      await request(getServer())
        .get(`/api/events/${createdEvent._id}/participants`)
        .expect(200)
        .expect((res) => {
          const participants = res.body as ParticipantResponse[];
          expect(participants).toHaveLength(1);
        });

      await request(getServer())
        .patch(`/api/events/${createdEvent._id}`)
        .send({ title: 'Updated Event' })
        .expect(200);

      await request(getServer())
        .get(`/api/events/${createdEvent._id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as EventResponse;
          expect(body.title).toBe('Updated Event');
        });

      await request(getServer())
        .delete(`/api/events/${createdEvent._id}`)
        .expect(200);

      await request(getServer())
        .get(`/api/events/${createdEvent._id}`)
        .expect(404);
    });
  });
});
