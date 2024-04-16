// src/questions/questions.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question, QuestionSchema } from './schema/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }])
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }])]  // Exporta el modelo para uso en otros módulos
})
export class QuestionsModule {}
