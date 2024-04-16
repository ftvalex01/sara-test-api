// src/tests/schemas/completed-test.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Question } from '../../questions/schema/question.schema';

export type CompletedTestDocument = Document & CompletedTest;

@Schema()
export class CompletedTest {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questions: Question[];

  @Prop()
  answers: string[]; 

  @Prop()
  createdAt: Date; 
}

export const CompletedTestSchema = SchemaFactory.createForClass(CompletedTest);
