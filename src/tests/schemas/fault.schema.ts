import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FaultDocument = Document & {
  userId: Types.ObjectId;
  questionId: number; // Cambiado a número ya que estamos usando el campo id de las preguntas
  attemptedAnswer: string;
  createdAt: Date;
  testName?: string;
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
}

export const FaultSchema = SchemaFactory.createForClass(Fault);
