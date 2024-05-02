// src/tests/schemas/completed-test.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question } from '../../questions/schema/question.schema';

export type CompletedTestDocument = Document & {
  userId: Types.ObjectId;
  questions: Types.ObjectId[];
  answers: string[];
  createdAt: Date;
  testName?: string;
};

@Schema()
export class CompletedTest {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Question' }] })
  questions: Types.ObjectId[];

  @Prop()
  answers: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop() 
  testName?: string;
}

export const CompletedTestSchema = SchemaFactory.createForClass(CompletedTest);
