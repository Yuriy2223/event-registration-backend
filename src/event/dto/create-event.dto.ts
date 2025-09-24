// export class CreateEventDto {
//   imgUrl: string;
//   title: string;
//   description: string;
//   eventDate: Date;
//   organizer: string;
// }
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'URL of the event image',
    example: 'https://example.com/event-image.jpg',
  })
  imgUrl: string;

  @ApiProperty({
    description: 'Title of the event',
    example: 'Tech Conference 2024',
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    example:
      'Join us for an exciting tech conference featuring the latest innovations',
  })
  description: string;

  @ApiProperty({
    description: 'Date and time when the event will take place',
    example: '2024-12-31T18:00:00.000Z',
  })
  eventDate: Date;

  @ApiProperty({
    description: 'Name of the event organizer',
    example: 'Tech Events Corp',
  })
  organizer: string;
}
