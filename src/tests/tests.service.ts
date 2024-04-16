// src/tests/tests.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from 'src/questions/schema/question.schema';
import { CompletedTest, CompletedTestDocument } from './schemas/completed-test.schema';
import { Fault, FaultDocument } from './schemas/fault.schema';
import { CompletedTestDto } from './dto/completed-test.dto';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(CompletedTest.name) private completedTestModel: Model<CompletedTestDocument>,
    @InjectModel(Fault.name) private faultModel: Model<FaultDocument>,
  ) {}

  async generateTest(userId: string, numberOfQuestions: number): Promise<Question[]> {
    const completedQuestionsIds = await this.completedTestModel.find({ userId: new Types.ObjectId(userId) }).distinct('questions');
    const availableQuestions = await this.questionModel.find({ _id: { $nin: completedQuestionsIds } }).limit(numberOfQuestions).exec();
    return availableQuestions;
  }

  async saveCompletedTest(completedTestData: CompletedTestDto): Promise<CompletedTest> {
    // Guardar el test completado
    const newCompletedTest = new this.completedTestModel({
      userId: new Types.ObjectId(completedTestData.userId),
      questions: completedTestData.answers.map(answer => new Types.ObjectId(answer.questionId)),
      answers: completedTestData.answers.map(answer => answer.selectedOption),
      createdAt: new Date()
    });
    
    await newCompletedTest.save();

    // Obtener las respuestas correctas para las preguntas
    const questions = await this.questionModel.find({
      '_id': { $in: completedTestData.answers.map(a => a.questionId) }
    }).exec();

    // Filtrar las respuestas incorrectas y prepararlas para ser guardadas como fallos
    const faults = completedTestData.answers
      .filter(answer => {
        const correctAnswer = questions.find(q => q._id.toString() === answer.questionId)?.answer;
        return correctAnswer !== answer.selectedOption;
      })
      .map(faultyAnswer => ({
        userId: new Types.ObjectId(completedTestData.userId),
        questionId: new Types.ObjectId(faultyAnswer.questionId),
        attemptedAnswer: faultyAnswer.selectedOption,
        createdAt: new Date() // Opcional si quieres la fecha exacta del fallo
      }));

    // Guardar las respuestas incorrectas en el modelo Fault
    if (faults.length > 0) {
      await this.faultModel.insertMany(faults);
    }

    // Retornar el test completado
    return newCompletedTest;
  }

  async getFaults(userId: string): Promise<Question[]> {
    const faults = await this.faultModel.find({ userId: new Types.ObjectId(userId) }).exec();
    const questionIds = faults.map(fault => fault.questionId);
    return this.questionModel.find({ _id: { $in: questionIds } }).exec();
  }


   // Función para reiniciar las preguntas contestadas para un usuario
   async resetCompletedTests(userId: string): Promise<{ success: boolean }> {
    try {
      // Opción 1: Eliminar los registros de CompletedTest
      await this.completedTestModel.deleteMany({ userId: new Types.ObjectId(userId) });

      // Opción 2: Archivar los registros si necesitas mantener un historial
      // Podrías agregar un campo 'archived' al esquema y marcarlo aquí

      return { success: true };
    } catch (error) {
      console.error('Error resetting completed tests:', error);
      return { success: false };
    }
  }
}



