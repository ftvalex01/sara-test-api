import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompletedTestDocument = Document & {
  userId: Types.ObjectId;
  questions: number[]; 
  answers: string[];
  createdAt: Date;
  testName?: string;
  category: string;
};

@Schema()
export class CompletedTest {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: [Number], required: true })
  questions: number[];

  @Prop()
  answers: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  testName?: string;

  @Prop()
  category: string;
}

export const CompletedTestSchema = SchemaFactory.createForClass(CompletedTest);