import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ versionKey: false })
export class Site {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  address!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ required: true, trim: true })
  author!: string;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

// Full-text search index across title, address, and body content
SiteSchema.index(
  { title: 'text', address: 'text', body: 'text' },
  {
    weights: { title: 10, address: 5, body: 2 },
    name: 'SiteTextSearchIndex',
  },
);
