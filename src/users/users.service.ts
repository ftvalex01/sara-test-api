// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async validateUser(username: string, pass: string): Promise<UserDocument | null> {
    const user = await this.findOne(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      return user;
    }
    return null;
  }

  async create(userDto: { username: string; password: string }): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const newUser = new this.userModel({
      username: userDto.username,
      password: hashedPassword
    });
    return newUser.save();
  }
}
