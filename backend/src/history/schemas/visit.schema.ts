import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NavigationType = 'typed' | 'link' | 'back' | 'forward';
export type VisitDocument = HydratedDocument<Visit>;

@Schema({ versionKey: false })
export class Visit {
  @Prop({ required: true, index: true, trim: true })
  userId!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  address!: string;

  @Prop({ required: true, default: () => new Date(), index: true })
  timestamp!: Date;

  @Prop({
    required: true,
    enum: ['typed', 'link', 'back', 'forward'],
  })
  navigationType!: NavigationType;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ userId: 1, timestamp: -1 });
