// src/users/schema/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = Document & User;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({
    required: true,
    set: (password: string) => bcrypt.hashSync(password, 10) 
  })
  password: string;

  @Prop({ required: true })
  category: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
