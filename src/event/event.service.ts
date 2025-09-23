import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { Participant, ParticipantDocument } from './schemas/participant.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterParticipantDto } from './dto/register-participant.dto';

interface GetEventsQuery {
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface GetParticipantsQuery {
  search?: string;
}

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
  ) {}

  async getEvents(query: GetEventsQuery) {
    const {
      sortField = 'title',
      sortOrder = 'asc',
      page = 1,
      limit = 8,
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const totalEvents = await this.eventModel.countDocuments().exec();
    const skip = (pageNumber - 1) * limitNumber;

    const events = await this.eventModel
      .find()
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNumber)
      .exec();

    return {
      events,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalEvents / limitNumber),
      totalEvents,
    };
  }

  async createEvent(createEventDto: CreateEventDto): Promise<EventDocument> {
    const event = new this.eventModel(createEventDto);
    return await event.save();
  }

  async getEventById(eventId: string): Promise<EventDocument | null> {
    if (!Types.ObjectId.isValid(eventId)) {
      return null;
    }
    return await this.eventModel.findById(eventId).exec();
  }

  async updateEvent(
    eventId: string,
    updateEventDto: UpdateEventDto,
  ): Promise<EventDocument | null> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid eventId format');
    }

    return await this.eventModel
      .findByIdAndUpdate(eventId, updateEventDto, { new: true })
      .exec();
  }

  async deleteEvent(eventId: string): Promise<EventDocument | null> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid eventId format');
    }

    return await this.eventModel.findByIdAndDelete(eventId).exec();
  }

  async registerParticipant(
    eventId: string,
    registerParticipantDto: RegisterParticipantDto,
  ): Promise<ParticipantDocument> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid eventId format');
    }

    const participant = new this.participantModel({
      ...registerParticipantDto,
      eventId: new Types.ObjectId(eventId),
    });
    return await participant.save();
  }

  async getParticipants(
    eventId: string,
    query: GetParticipantsQuery,
  ): Promise<ParticipantDocument[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid eventId format');
    }

    const { search } = query;
    const mongoQuery: Record<string, unknown> = {
      eventId: new Types.ObjectId(eventId),
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      mongoQuery.$or = [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ];
    }

    return await this.participantModel.find(mongoQuery).exec();
  }
}
