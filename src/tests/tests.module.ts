// src/tests/tests.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { CompletedTest, CompletedTestSchema } from './schemas/completed-test.schema';
import { Fault, FaultSchema } from './schemas/fault.schema';
import { QuestionsModule } from '../questions/questions.module';  // Asegúrate de que la ruta es correcta

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompletedTest.name, schema: CompletedTestSchema },
      { name: Fault.name, schema: FaultSchema }
    ]),
    QuestionsModule  // Importa QuestionsModule para acceder a QuestionModel
  ],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService]
})
export class TestsModule {}
