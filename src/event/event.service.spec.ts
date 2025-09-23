import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventService } from './event.service';
import { Event } from './schemas/event.schema';
import { Participant } from './schemas/participant.schema';
import { BadRequestException } from '@nestjs/common';
import { Types, Model } from 'mongoose';

const mockEvent = {
  _id: new Types.ObjectId(),
  imgUrl: 'Test imgUrl',
  title: 'Test Event',
  description: 'Test Description',
  eventDate: new Date(),
  organizer: 'Test Organizer',
};

const mockEventModel = {
  new: jest.fn().mockResolvedValue(mockEvent),
  constructor: jest.fn().mockResolvedValue(mockEvent),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  exec: jest.fn(),
};

const mockParticipantModel = {
  new: jest.fn().mockResolvedValue({}),
  constructor: jest.fn().mockResolvedValue({}),
  find: jest.fn(),
  create: jest.fn(),
  exec: jest.fn(),
};

describe('EventService', () => {
  let service: EventService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
        {
          provide: getModelToken(Participant.name),
          useValue: mockParticipantModel,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      const mockEvents = [mockEvent];
      mockEventModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });
      mockEventModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockEvents),
            }),
          }),
        }),
      });

      const result = await service.getEvents({});

      expect(result).toEqual({
        events: mockEvents,
        currentPage: 1,
        totalPages: 1,
        totalEvents: 1,
      });
    });
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      const eventId = new Types.ObjectId().toString();
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });

      const result = await service.getEventById(eventId);

      expect(result).toEqual(mockEvent);
    });

    it('should return null for invalid id', async () => {
      const result = await service.getEventById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('createEvent', () => {
    it('should create and return event', async () => {
      const createEventDto = {
        imgUrl: 'New imgUrl',
        title: 'New Event',
        description: 'New Description',
        eventDate: new Date(),
        organizer: 'New Organizer',
      };
      const mockSave = jest.fn().mockResolvedValue(mockEvent);
      const MockEventModel = jest.fn().mockImplementation(() => ({
        save: mockSave,
      }));

      Object.defineProperty(service, 'eventModel', {
        value: MockEventModel as unknown as Model<Event>,
        writable: true,
      });

      await service.createEvent(createEventDto);

      expect(MockEventModel).toHaveBeenCalledWith(createEventDto);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('registerParticipant', () => {
    it('should throw error for invalid eventId', async () => {
      const registerDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dob: new Date(),
        referral: 'friends',
      };

      await expect(
        service.registerParticipant('invalid-id', registerDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
