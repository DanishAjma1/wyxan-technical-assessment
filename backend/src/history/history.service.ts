import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit, VisitDocument } from './schemas/visit.schema';
import { CreateVisitDto } from './dto/visit.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(Visit.name) private readonly visitModel: Model<VisitDocument>,
  ) {}

  async recordVisit(dto: CreateVisitDto): Promise<Visit> {
    const visit = new this.visitModel({
      userId: dto.userId,
      address: dto.address,
      navigationType: dto.navigationType,
      timestamp: dto.timestamp || new Date(),
    });
    return (await visit.save()).toObject();
  }

  async getUserHistory(username: string): Promise<Visit[]> {
    return this.visitModel
      .find({
        userId: { $regex: new RegExp(`^${username.trim()}$`, 'i') },
      })
      .sort({ timestamp: -1 })
      .lean()
      .exec();
  }
}
