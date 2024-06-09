import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuestionCollection, QuestionItem } from 'src/questions/schema/question.schema';
import { CompletedTest, CompletedTestDocument } from './schemas/completed-test.schema';
import { Fault, FaultDocument } from './schemas/fault.schema';
import { CompletedTestDto } from './dto/completed-test.dto';
import { TestResultsDto } from './dto/test-results.dto';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(QuestionCollection.name) private questionModel: Model<QuestionCollection>,
    @InjectModel(CompletedTest.name) private completedTestModel: Model<CompletedTestDocument>,
    @InjectModel(Fault.name) private faultModel: Model<FaultDocument>,
  ) {}

  // Genera un nuevo test excluyendo preguntas ya completadas por el usuario en una categoría específica
  async generateTest(userId: string, numberOfQuestions: number, category: string): Promise<QuestionItem[]> {
    // Obtener IDs de preguntas ya completadas por el usuario en la categoría
    const completedQuestionsIds = await this.completedTestModel.find({ userId: new Types.ObjectId(userId), category }).distinct('questions');

    // Obtener documentos de preguntas disponibles en la categoría
    const availableQuestionDocs = await this.questionModel.find({ category }).exec();
    const availableQuestions = availableQuestionDocs.flatMap(doc => doc.questions);

    // Filtrar preguntas para excluir las ya completadas
    const filteredQuestions = availableQuestions.filter(q => !completedQuestionsIds.includes(q.id));

    // Devolver el número solicitado de preguntas
    return filteredQuestions.slice(0, numberOfQuestions);
  }

  // Obtiene preguntas disponibles para un usuario en una categoría específica, excluyendo las ya completadas
  async getAvailableQuestions(userId: string, category: string): Promise<QuestionItem[]> {
    // Obtener IDs de preguntas ya completadas por el usuario en la categoría
    const completedQuestionsIds = await this.completedTestModel.find({ userId: new Types.ObjectId(userId), category }).distinct('questions');

    // Obtener documentos de preguntas disponibles en la categoría
    const availableQuestionDocs = await this.questionModel.find({ category }).exec();
    const availableQuestions = availableQuestionDocs.flatMap(doc => doc.questions);

    // Filtrar preguntas para excluir las ya completadas
    const uniqueCompletedQuestionIds = [...new Set(completedQuestionsIds)];
    const filteredQuestions = availableQuestions.filter(q => !uniqueCompletedQuestionIds.includes(q.id));

    // Devolver las preguntas filtradas
    return filteredQuestions;
  }

  // Guarda un test completado y actualiza los fallos del usuario
  async saveCompletedTest(completedTestData: CompletedTestDto): Promise<TestResultsDto> {
    // Crear y guardar el nuevo test completado
    const newCompletedTest = new this.completedTestModel({
      userId: new Types.ObjectId(completedTestData.userId),
      questions: completedTestData.answers.map(answer => answer.questionId),
      answers: completedTestData.answers.map(answer => answer.selectedOption),
      createdAt: new Date(),
      testName: completedTestData.testName,
      category: completedTestData.category,
    });
    await newCompletedTest.save();
  
    // Obtener documentos de preguntas correspondientes a las respuestas del usuario
    const questionIds = completedTestData.answers.map(a => a.questionId);
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds }, category: completedTestData.category }).exec();
    const questions = questionDocs.flatMap(doc => doc.questions);
  
    // Detallar resultados de respuestas correctas e incorrectas
    const details = completedTestData.answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question?.correct_answer === answer.selectedOption;
      return { questionId: answer.questionId, correct_answer: question?.correct_answer, selectedAnswer: answer.selectedOption, isCorrect };
    });
  
    // Crear nuevos fallos para respuestas incorrectas
    const faults = details.filter(d => !d.isCorrect).map(faultyAnswer => ({
      userId: new Types.ObjectId(completedTestData.userId),
      questionId: faultyAnswer.questionId,
      attemptedAnswer: faultyAnswer.selectedAnswer,
      createdAt: new Date(),
      testName: completedTestData.testName,
      category: completedTestData.category,
    }));
  
    // Guardar los fallos nuevos, evitando duplicados
    for (const fault of faults) {
      const existingFault = await this.faultModel.findOne({ userId: fault.userId, questionId: fault.questionId, category: fault.category });
      if (!existingFault) {
        await this.faultModel.create(fault);
      }
    }
  
    // Eliminar fallos para respuestas que fueron correctas
    for (const detail of details.filter(d => d.isCorrect)) {
      await this.faultModel.deleteOne({ userId: new Types.ObjectId(completedTestData.userId), questionId: detail.questionId, category: completedTestData.category });
    }
  
    // Devolver los resultados del test
    const results: TestResultsDto = {
      correctCount: details.filter(d => d.isCorrect).length,
      incorrectCount: details.filter(d => !d.isCorrect).length,
      totalQuestions: details.length,
      details
    };
    return results;
  }

  // Obtiene los tests completados por un usuario en una categoría específica
  async getCompletedTests(userId: string, category: string): Promise<any[]> {
    // Obtener tests completados por el usuario en la categoría
    const tests = await this.completedTestModel.find({ userId: new Types.ObjectId(userId), category }).exec();

    // Obtener documentos de preguntas correspondientes
    const questionIds = tests.flatMap(test => test.questions);
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds }, category }).exec();
    const allQuestions = questionDocs.flatMap(doc => doc.questions);
  
    // Devolver tests con detalles de preguntas
    return tests.map(test => ({
      ...test.toObject(),
      questions: (test.questions as number[]).map(questionId => {
        const questionDoc = allQuestions.find(q => q.id === questionId);
        return {
          questionId: questionDoc?.id,
          question: questionDoc?.question,
          options: questionDoc?.options,
          correct_answer: questionDoc?.correct_answer,
        };
      }),
      answers: test.answers
    }));
  }

  // Obtiene preguntas falladas por un usuario en una categoría específica, limitadas por un número
  async getFaultsTest(userId: string, limit: number, testName: string, category: string): Promise<QuestionItem[]> {
    // Obtener los fallos del usuario para la categoría especificada
    const faults = await this.faultModel.find({ userId: new Types.ObjectId(userId), category }).limit(limit).exec();
    const questionIds = faults.map(fault => fault.questionId);

    // Obtener los documentos de preguntas correspondientes
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds }, category }).exec();
    const allQuestions = questionDocs.flatMap(doc => doc.questions);
    const uniqueQuestionIds = [...new Set(questionIds)];

    // Filtrar y devolver las preguntas únicas
    const filteredQuestions = allQuestions.filter(q => uniqueQuestionIds.includes(q.id));

    return filteredQuestions;
  }

  // Cuenta el número de fallos de un usuario en una categoría específica
  async countFaults(userId: string, category: string): Promise<number> {
    return this.faultModel.countDocuments({ userId: new Types.ObjectId(userId), category }).exec();
  }

  // Resetea los tests completados y fallos de un usuario
  async resetCompletedTests(userId: string): Promise<{ success: boolean }> {
    try {
      await this.completedTestModel.deleteMany({ userId: new Types.ObjectId(userId) });
      await this.faultModel.deleteMany({ userId: new Types.ObjectId(userId) });
      return { success: true };
    } catch (error) {
      console.error('Error resetting completed tests:', error);
      return { success: false };
    }
  }

  // Obtiene todas las preguntas falladas por un usuario en una categoría específica
  async getFaults(userId: string, category: string): Promise<QuestionItem[]> {
    // Obtener fallos del usuario en la categoría
    const faults = await this.faultModel.find({ userId: new Types.ObjectId(userId), category }).exec();
    const questionIds = faults.map(fault => fault.questionId);

    // Obtener documentos de preguntas correspondientes
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds }, category }).exec();
    
    // Devolver preguntas correspondientes a los fallos
    return questionDocs.flatMap(doc => doc.questions).filter(q => questionIds.includes(q.id));
  }
}
