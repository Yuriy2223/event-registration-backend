// export class RegisterParticipantDto {
//   fullName: string;
//   email: string;
//   dob: Date;
//   referral: string;
// }
import { ApiProperty } from '@nestjs/swagger';

export class RegisterParticipantDto {
  @ApiProperty({
    description: 'Full name of the participant',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Email address of the participant',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Date of birth of the participant',
    example: '1990-01-01T00:00:00.000Z',
  })
  dob: Date;

  @ApiProperty({
    description: 'How the participant found out about the event',
    example: 'Social Media',
    required: false,
  })
  referral: string;
}
