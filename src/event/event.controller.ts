import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventService } from './event.service';
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

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getEvents(@Query() query: GetEventsQuery) {
    try {
      return await this.eventService.getEvents(query);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    const { imgUrl, title, description, eventDate, organizer } = createEventDto;

    if (!imgUrl || !title || !description || !eventDate || !organizer) {
      throw new BadRequestException('All fields are required.');
    }

    try {
      return await this.eventService.createEvent(createEventDto);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get(':eventId/participants')
  async getParticipants(
    @Param('eventId') eventId: string,
    @Query() query: GetParticipantsQuery,
  ) {
    try {
      return await this.eventService.getParticipants(eventId, query);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Invalid eventId format'
      ) {
        throw new BadRequestException('Invalid eventId format');
      }
      console.error('Error fetching participants:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Post(':eventId/register')
  async registerParticipant(
    @Param('eventId') eventId: string,
    @Body() registerParticipantDto: RegisterParticipantDto,
  ) {
    const { fullName, email, dob } = registerParticipantDto;

    if (!fullName || !email || !dob) {
      throw new BadRequestException(
        'Full name, email, and date of birth are required.',
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format.');
    }

    if (new Date(dob) > new Date()) {
      throw new BadRequestException('Date of birth cannot be in the future.');
    }

    try {
      return await this.eventService.registerParticipant(
        eventId,
        registerParticipantDto,
      );
    } catch (error) {
      console.error('Error registering participant:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get(':eventId')
  async getEventById(@Param('eventId') eventId: string) {
    try {
      const event = await this.eventService.getEventById(eventId);
      if (!event) {
        throw new NotFoundException('Event not found.');
      }
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Patch(':eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    try {
      const updatedEvent = await this.eventService.updateEvent(
        eventId,
        updateEventDto,
      );
      if (!updatedEvent) {
        throw new NotFoundException('Event not found.');
      }
      return updatedEvent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Delete(':eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    try {
      const deletedEvent = await this.eventService.deleteEvent(eventId);
      if (!deletedEvent) {
        throw new NotFoundException('Event not found.');
      }
      return { message: 'Event deleted successfully', eventId };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
