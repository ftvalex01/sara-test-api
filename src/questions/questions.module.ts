import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionCollection, QuestionSchema } from './schema/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QuestionCollection.name, schema: QuestionSchema }])
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [MongooseModule.forFeature([{ name: QuestionCollection.name, schema: QuestionSchema }])]  // Exporta el modelo para uso en otros módulos
})
export class QuestionsModule {}
