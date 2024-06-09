import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FaultDocument = Document & {
  userId: Types.ObjectId;
  questionId: number; 
  attemptedAnswer: string;
  createdAt: Date;
  testName?: string;
  category: string;
};

@Schema()
export class Fault {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  questionId: number;

  @Prop({ required: true })
  attemptedAnswer: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  testName?: string;

  @Prop({ required: true })
  category: string;
}

export const FaultSchema = SchemaFactory.createForClass(Fault);
