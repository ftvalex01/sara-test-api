import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Document & Question;

@Schema()
export class Question {
  @Prop({ required: true })
  question: string;

  @Prop({ type: Map, of: String })
  options: Map<string, string>;  // Usamos un mapa para las opciones

  @Prop({ required: true })
  correct_answer: string;  // Asegúrate de que el nombre del campo coincida con tus datos
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
