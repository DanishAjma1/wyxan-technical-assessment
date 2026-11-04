import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
