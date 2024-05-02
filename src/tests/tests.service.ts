// src/tests/tests.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from 'src/questions/schema/question.schema';
import { CompletedTest, CompletedTestDocument } from './schemas/completed-test.schema';
import { Fault, FaultDocument } from './schemas/fault.schema';
import { CompletedTestDto } from './dto/completed-test.dto';
import { TestResultsDto } from './dto/test-results.dto';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(CompletedTest.name) private completedTestModel: Model<CompletedTestDocument>,
    @InjectModel(Fault.name) private faultModel: Model<FaultDocument>,
  ) { }

  async generateTest(userId: string, numberOfQuestions: number): Promise<Question[]> {

    const completedQuestionsIds = await this.completedTestModel.find({ userId: new Types.ObjectId(userId) }).distinct('questions');
    const availableQuestions = await this.questionModel.find({ _id: { $nin: completedQuestionsIds } }).limit(numberOfQuestions).exec();
    return availableQuestions;
  }

  async saveCompletedTest(completedTestData: CompletedTestDto): Promise<TestResultsDto> {
    // Guarda el test completado
    console.log(completedTestData)
    const newCompletedTest = new this.completedTestModel({
        userId: new Types.ObjectId(completedTestData.userId),
        questions: completedTestData.answers.map(answer => new Types.ObjectId(answer.questionId)),
        answers: completedTestData.answers.map(answer => answer.selectedOption),
        createdAt: new Date(),
        testName: completedTestData.testName,
    });
    await newCompletedTest.save();

    // Detalles de las respuestas
    const questions = await this.questionModel.find({'_id': { $in: completedTestData.answers.map(a => a.questionId) }}).exec();
    const details = completedTestData.answers.map(answer => {
        const question = questions.find(q => q._id.toString() === answer.questionId);
        const isCorrect = question?.correct_answer === answer.selectedOption; 
        return { questionId: answer.questionId, correctAnswer: question?.correct_answer, selectedAnswer: answer.selectedOption, isCorrect };
    });

    // Filtra para encontrar sólo fallos no acertados previamente
    const newFaults = details.filter(d => !d.isCorrect && !this.faultModel.exists({ userId: new Types.ObjectId(completedTestData.userId), questionId: new Types.ObjectId(d.questionId) }));
    await this.faultModel.insertMany(newFaults);

    // Elimina o actualiza fallos acertados
    details.filter(d => d.isCorrect).forEach(async (detail) => {
        await this.faultModel.deleteOne({ userId: new Types.ObjectId(completedTestData.userId), questionId: new Types.ObjectId(detail.questionId) });
    });

    // Devuelve los resultados
    const results = {
        correctCount: details.filter(d => d.isCorrect).length,
        incorrectCount: details.filter(d => !d.isCorrect).length,
        totalQuestions: details.length,
        details
    };
    return results;
}

  async getFaults(userId: string): Promise<Question[]> {
    const faults = await this.faultModel.find({ userId: new Types.ObjectId(userId) }).exec();
    const questionIds = faults.map(fault => fault.questionId);
    return this.questionModel.find({ _id: { $in: questionIds } }).exec();
  }


async getFaultsTest(userId: string, limit: number): Promise<Question[]> {
  const faults = await this.faultModel.find({ userId: new Types.ObjectId(userId) }).limit(limit).exec();
  const questionIds = faults.map(fault => fault.questionId);
  return this.questionModel.find({ _id: { $in: questionIds } }).exec();
}

// En tu archivo de servicio en NestJS
async countFaults(userId: string): Promise<number> {
  return this.faultModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec();
}

  // Función para reiniciar las preguntas contestadas para un usuario
  async resetCompletedTests(userId: string): Promise<{ success: boolean }> {
    try {
      // Opción 1: Eliminar los registros de CompletedTest
      await this.completedTestModel.deleteMany({ userId: new Types.ObjectId(userId) });
      await this.faultModel.deleteMany({ userId: new Types.ObjectId(userId) });
      // Opción 2: Archivar los registros si necesitas mantener un historial
      // Podrías agregar un campo 'archived' al esquema y marcarlo aquí

      return { success: true };
    } catch (error) {
      console.error('Error resetting completed tests:', error);
      return { success: false };
    }
  }
  async getCompletedTests(userId?: string): Promise<any[]> {
    const query = userId ? { userId: new Types.ObjectId(userId) } : {};
    const tests = await this.completedTestModel.find(query)
        .populate({
            path: 'questions',
            model: 'Question',
            select: 'question options correct_answer'
        })
        .exec();

    console.log("Tests with populated questions:", tests);

    return tests.map(test => ({
      ...test.toObject(),
      questions: (test.questions as any[]).map(question => ({
        questionId: question._id.toString(),
        question: question.question,
        options: question.options,
        correctAnswer: question.correct_answer
      })),
      answers: test.answers
    }));
}



}



