import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockEventService = {
  getEvents: jest.fn(),
  createEvent: jest.fn(),
  getEventById: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  registerParticipant: jest.fn(),
  getParticipants: jest.fn(),
};

const mockEvent = {
  _id: new Types.ObjectId(),
  imgUrl: 'Test imgUrl',
  title: 'Test Event',
  description: 'Test Description',
  eventDate: new Date(),
  organizer: 'Test Organizer',
};

describe('EventController', () => {
  let controller: EventController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return events', async () => {
      const expectedResult = {
        events: [mockEvent],
        currentPage: 1,
        totalPages: 1,
        totalEvents: 1,
      };

      mockEventService.getEvents.mockResolvedValue(expectedResult);

      const result = await controller.getEvents({});

      expect(result).toEqual(expectedResult);
      expect(mockEventService.getEvents).toHaveBeenCalledWith({});
    });
  });

  describe('createEvent', () => {
    it('should create event', async () => {
      const createEventDto = {
        imgUrl: 'New imgUrl',
        title: 'New Event',
        description: 'New Description',
        eventDate: new Date(),
        organizer: 'New Organizer',
      };

      mockEventService.createEvent.mockResolvedValue(mockEvent);

      const result = await controller.createEvent(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(mockEventService.createEvent).toHaveBeenCalledWith(createEventDto);
    });

    it('should throw BadRequestException if fields are missing', async () => {
      const invalidDto = {
        imgUrl: 'Valid URL',
        title: '',
        description: 'Description',
        eventDate: new Date(),
        organizer: 'Organizer',
      };

      await expect(controller.createEvent(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      const eventId = new Types.ObjectId().toString();
      mockEventService.getEventById.mockResolvedValue(mockEvent);

      const result = await controller.getEventById(eventId);

      expect(result).toEqual(mockEvent);
      expect(mockEventService.getEventById).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId().toString();
      mockEventService.getEventById.mockResolvedValue(null);

      await expect(controller.getEventById(eventId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('registerParticipant', () => {
    it('should register participant', async () => {
      const eventId = new Types.ObjectId().toString();
      const registerDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dob: new Date('1990-01-01'),
        referral: 'friends',
      };
      const mockParticipant = { ...registerDto, eventId };

      mockEventService.registerParticipant.mockResolvedValue(mockParticipant);

      const result = await controller.registerParticipant(eventId, registerDto);

      expect(result).toEqual(mockParticipant);
      expect(mockEventService.registerParticipant).toHaveBeenCalledWith(
        eventId,
        registerDto,
      );
    });

    it('should throw BadRequestException for invalid email', async () => {
      const eventId = new Types.ObjectId().toString();
      const invalidDto = {
        fullName: 'John Doe',
        email: 'invalid-email',
        dob: new Date('1990-01-01'),
        referral: 'friends',
      };

      await expect(
        controller.registerParticipant(eventId, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for future birth date', async () => {
      const eventId = new Types.ObjectId().toString();
      const invalidDto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        dob: new Date('2030-01-01'),
        referral: 'friends',
      };

      await expect(
        controller.registerParticipant(eventId, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateEvent', () => {
    it('should update event', async () => {
      const eventId = new Types.ObjectId().toString();
      const updateDto = { title: 'Updated Title' };
      const updatedEvent = { ...mockEvent, ...updateDto };

      mockEventService.updateEvent.mockResolvedValue(updatedEvent);

      const result = await controller.updateEvent(eventId, updateDto);

      expect(result).toEqual(updatedEvent);
      expect(mockEventService.updateEvent).toHaveBeenCalledWith(
        eventId,
        updateDto,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId().toString();
      const updateDto = { title: 'Updated Title' };

      mockEventService.updateEvent.mockResolvedValue(null);

      await expect(controller.updateEvent(eventId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete event', async () => {
      const eventId = new Types.ObjectId().toString();
      mockEventService.deleteEvent.mockResolvedValue(mockEvent);

      const result = await controller.deleteEvent(eventId);

      expect(result).toEqual({
        message: 'Event deleted successfully',
        eventId,
      });
      expect(mockEventService.deleteEvent).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId().toString();
      mockEventService.deleteEvent.mockResolvedValue(null);

      await expect(controller.deleteEvent(eventId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
