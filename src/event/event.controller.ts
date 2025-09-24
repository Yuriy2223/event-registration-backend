// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Query,
//   Patch,
//   Delete,
//   BadRequestException,
//   NotFoundException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { EventService } from './event.service';
// import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
// import { RegisterParticipantDto } from './dto/register-participant.dto';

// interface GetEventsQuery {
//   sortField?: string;
//   sortOrder?: 'asc' | 'desc';
//   page?: number;
//   limit?: number;
// }

// interface GetParticipantsQuery {
//   search?: string;
// }

// @Controller('events')
// export class EventController {
//   constructor(private readonly eventService: EventService) {}

//   @Get()
//   async getEvents(@Query() query: GetEventsQuery) {
//     try {
//       return await this.eventService.getEvents(query);
//     } catch (error) {
//       throw new InternalServerErrorException(
//         error instanceof Error ? error.message : 'Unknown error',
//       );
//     }
//   }

//   @Post()
//   async createEvent(@Body() createEventDto: CreateEventDto) {
//     const { imgUrl, title, description, eventDate, organizer } = createEventDto;

//     if (!imgUrl || !title || !description || !eventDate || !organizer) {
//       throw new BadRequestException('All fields are required.');
//     }

//     try {
//       return await this.eventService.createEvent(createEventDto);
//     } catch (error) {
//       throw new BadRequestException(
//         error instanceof Error ? error.message : 'Unknown error',
//       );
//     }
//   }

//   @Get(':eventId/participants')
//   async getParticipants(
//     @Param('eventId') eventId: string,
//     @Query() query: GetParticipantsQuery,
//   ) {
//     try {
//       return await this.eventService.getParticipants(eventId, query);
//     } catch (error) {
//       if (
//         error instanceof Error &&
//         error.message === 'Invalid eventId format'
//       ) {
//         throw new BadRequestException('Invalid eventId format');
//       }
//       console.error('Error fetching participants:', error);
//       throw new InternalServerErrorException(
//         error instanceof Error ? error.message : 'Unknown error',
//       );
//     }
//   }

//   @Post(':eventId/register')
//   async registerParticipant(
//     @Param('eventId') eventId: string,
//     @Body() registerParticipantDto: RegisterParticipantDto,
//   ) {
//     const { fullName, email, dob } = registerParticipantDto;

//     if (!fullName || !email || !dob) {
//       throw new BadRequestException(
//         'Full name, email, and date of birth are required.',
//       );
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       throw new BadRequestException('Invalid email format.');
//     }

//     if (new Date(dob) > new Date()) {
//       throw new BadRequestException('Date of birth cannot be in the future.');
//     }

//     try {
//       return await this.eventService.registerParticipant(
//         eventId,
//         registerParticipantDto,
//       );
//     } catch (error) {
//       console.error('Error registering participant:', error);
//       throw new InternalServerErrorException(
//         error instanceof Error ? error.message : 'Unknown error',
//       );
//     }
//   }

//   @Get(':eventId')
//   async getEventById(@Param('eventId') eventId: string) {
//     try {
//       const event = await this.eventService.getEventById(eventId);
//       if (!event) {
//         throw new NotFoundException('Event not found.');
//       }
//       return event;
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new InternalServerErrorException(
//         error instanceof Error ? error.message : 'Unknown error',
//       );
//     }
//   }

//   @Patch(':eventId')
//   async updateEvent(
//     @Param('eventId') eventId: string,
//     @Body() updateEventDto: UpdateEventDto,
//   ) {
//     try {
//       const updatedEvent = await this.eventService.updateEvent(
//         eventId,
//         updateEventDto,
//       );
//       if (!updatedEvent) {
//         throw new NotFoundException('Event not found.');
//       }
//       return updatedEvent;
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new InternalServerErrorException(
//         error instanceof Error ? error.message : 'Unknown error',
//       );
//     }
//   }

//   @Delete(':eventId')
//   async deleteEvent(@Param('eventId') eventId: string) {
//     try {
//       const deletedEvent = await this.eventService.deleteEvent(eventId);
//       if (!deletedEvent) {
//         throw new NotFoundException('Event not found.');
//       }
//       return { message: 'Event deleted successfully', eventId };
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new InternalServerErrorException(
//         error instanceof Error ? error.message : 'Unknown error',
//       );
//     }
//   }
// }
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all events',
    description: 'Retrieve a paginated list of events with optional sorting',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    description: 'Field to sort by',
    example: 'eventDate',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({
    summary: 'Create a new event',
    description: 'Create a new event with the provided details',
  })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiTags('participants')
  @ApiOperation({
    summary: 'Get event participants',
    description:
      'Retrieve all participants for a specific event with optional search',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or email',
    example: 'John',
  })
  @ApiResponse({
    status: 200,
    description: 'Participants retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid eventId format' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiTags('participants')
  @ApiOperation({
    summary: 'Register participant for event',
    description: 'Register a new participant for a specific event',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: RegisterParticipantDto })
  @ApiResponse({
    status: 201,
    description: 'Participant registered successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Retrieve a specific event by its unique identifier',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({
    summary: 'Update event',
    description: 'Update an existing event with new details',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateEventDto,
    description: 'Fields to update (all optional)',
    examples: {
      'Update title': {
        summary: 'Update only the title',
        value: { title: 'Updated Event Title' },
      },
      'Update multiple fields': {
        summary: 'Update multiple fields',
        value: {
          title: 'Updated Event',
          description: 'Updated description',
          organizer: 'New Organizer',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({
    summary: 'Delete event',
    description: 'Delete an existing event by its unique identifier',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Event deleted successfully' },
        eventId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
