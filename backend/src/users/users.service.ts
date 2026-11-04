import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().sort({ name: 1 }).lean().exec();
  }

  async findByName(name: string): Promise<User | null> {
    return this.userModel
      .findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } })
      .lean()
      .exec();
  }

  async findOrCreate(dto: CreateUserDto): Promise<User> {
    const trimmedName = dto.name.trim();
    const existing = await this.findByName(trimmedName);
    if (existing) {
      return existing;
    }
    const created = new this.userModel({ name: trimmedName });
    return (await created.save()).toObject();
  }
}
