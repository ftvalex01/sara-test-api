import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(username: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ username }).exec();
    } catch (error) {
      throw new HttpException('Database error: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUser(username: string, pass: string): Promise<UserDocument | null> {
    try {
      const user = await this.findOne(username);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Database error: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(userDto: { username: string; password: string }): Promise<UserDocument> {
    try {
      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      const newUser = new this.userModel({
        username: userDto.username,
        password: hashedPassword
      });
      return await newUser.save();
    } catch (error) {
      throw new HttpException('Database error: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
