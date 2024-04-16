// src/tests/schemas/fault.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FaultDocument = Document & {
  userId: Types.ObjectId; // Referencia al usuario que falló la pregunta
  questionId: Types.ObjectId; // Referencia a la pregunta que fue fallada
  attemptedAnswer: string; // La respuesta que el usuario intentó
  createdAt: Date; // Fecha en que la pregunta fue fallada
};

@Schema()
export class Fault {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  attemptedAnswer: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FaultSchema = SchemaFactory.createForClass(Fault);
