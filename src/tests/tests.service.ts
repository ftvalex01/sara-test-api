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
    console.log(userId)
    console.log(numberOfQuestions)
    const completedQuestionsIds = await this.completedTestModel.find({ userId: new Types.ObjectId(userId) }).distinct('questions');
    const availableQuestions = await this.questionModel.find({ _id: { $nin: completedQuestionsIds } }).limit(numberOfQuestions).exec();
    return availableQuestions;
  }

  async saveCompletedTest(completedTestData: CompletedTestDto): Promise<TestResultsDto> {
    const newCompletedTest = new this.completedTestModel({
        userId: new Types.ObjectId(completedTestData.userId),
        questions: completedTestData.answers.map(answer => new Types.ObjectId(answer.questionId)),
        answers: completedTestData.answers.map(answer => answer.selectedOption),
        createdAt: new Date()
    });

    // Guarda el test completado en la base de datos
    await newCompletedTest.save();

    // Busca las preguntas para obtener las respuestas correctas
    const questions = await this.questionModel.find({
        '_id': { $in: completedTestData.answers.map(a => a.questionId) }
    }).exec();

    // Prepara los detalles de las respuestas
    const details = completedTestData.answers.map(answer => {
        const question = questions.find(q => q._id.toString() === answer.questionId);
        const isCorrect = question?.correct_answer === answer.selectedOption; 
        return {
            questionId: answer.questionId,
            correctAnswer: question?.correct_answer, 
            selectedAnswer: answer.selectedOption,
            isCorrect: isCorrect
        };
    });

    // Guarda las respuestas falladas para futuros tests
    const faults = details.filter(d => !d.isCorrect).map(faultyAnswer => ({
        userId: new Types.ObjectId(completedTestData.userId),
        questionId: new Types.ObjectId(faultyAnswer.questionId),
        attemptedAnswer: faultyAnswer.selectedAnswer,
        createdAt: new Date()
    }));

    if (faults.length > 0) {
        await this.faultModel.insertMany(faults);
    }

    // Prepara y devuelve los resultados del test
    const results = {
        correctCount: details.filter(d => d.isCorrect).length,
        incorrectCount: details.filter(d => !d.isCorrect).length,
        totalQuestions: details.length,
        details: details
    };

    return results;
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



