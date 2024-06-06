import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class QuestionItem {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, type: Map })
  options: Record<string, string>;

  @Prop({ required: true })
  correct_answer: string;

  @Prop({ type: Number, required: true })
  id: number;
}

@Schema()
export class QuestionCollection extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [QuestionItem], required: true })
  questions: QuestionItem[];
}

export type QuestionDocument = QuestionCollection & Document;
export const QuestionSchema = SchemaFactory.createForClass(QuestionCollection);
