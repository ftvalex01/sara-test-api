// src/tests/schema/test.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type QuestionDocument = Document & Question;

@Schema()
export class Question {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true })
  answer: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
