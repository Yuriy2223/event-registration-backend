import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ParticipantDocument = HydratedDocument<Participant>;

@Schema({ timestamps: true })
export class Participant {
  @Prop({ required: true })
  fullName: string;

  @Prop({
    required: true,
    match: /.+@.+\..+/,
  })
  email: string;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true })
  referral: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Event',
    required: true,
  })
  eventId: Types.ObjectId;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

ParticipantSchema.methods.isDobValid = function (this: ParticipantDocument) {
  return this.dob <= new Date();
};
