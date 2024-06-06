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

  async generateTest(userId: string, numberOfQuestions: number, category: string): Promise<QuestionItem[]> {
    const completedQuestionsIds = await this.completedTestModel.find({ userId: new Types.ObjectId(userId) }).distinct('questions');
    const availableQuestionDocs = await this.questionModel.find({ category }).exec();

    const availableQuestions = availableQuestionDocs.flatMap(doc => doc.questions);
    const filteredQuestions = availableQuestions.filter(q => !completedQuestionsIds.includes(q.id));

    return filteredQuestions.slice(0, numberOfQuestions);
  }

  async getAvailableQuestions(userId: string, category: string): Promise<QuestionItem[]> {
    const completedQuestionsIds = await this.completedTestModel.find({ userId: new Types.ObjectId(userId) }).distinct('questions');
    const availableQuestionDocs = await this.questionModel.find({ category }).exec();

    const availableQuestions = availableQuestionDocs.flatMap(doc => doc.questions);
    return availableQuestions.filter(q => !completedQuestionsIds.includes(q.id));
  }

  async saveCompletedTest(completedTestData: CompletedTestDto): Promise<TestResultsDto> {
    const newCompletedTest = new this.completedTestModel({
      userId: new Types.ObjectId(completedTestData.userId),
      questions: completedTestData.answers.map(answer => answer.questionId),
      answers: completedTestData.answers.map(answer => answer.selectedOption),
      createdAt: new Date(),
      testName: completedTestData.testName,
    });
    await newCompletedTest.save();

    const questionIds = completedTestData.answers.map(a => a.questionId);
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds } }).exec();
    const questions = questionDocs.flatMap(doc => doc.questions);

    const details = completedTestData.answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question?.correct_answer === answer.selectedOption;
      return { questionId: answer.questionId, correct_answer: question?.correct_answer, selectedAnswer: answer.selectedOption, isCorrect };
    });

    const faults = details.filter(d => !d.isCorrect).map(faultyAnswer => ({
      userId: new Types.ObjectId(completedTestData.userId),
      questionId: faultyAnswer.questionId,
      attemptedAnswer: faultyAnswer.selectedAnswer,
      createdAt: new Date(),
      testName: completedTestData.testName,
    }));

    for (const fault of faults) {
      const existingFault = await this.faultModel.findOne({ userId: fault.userId, questionId: fault.questionId });
      if (!existingFault) {
        await this.faultModel.create(fault);
      }
    }

    for (const detail of details.filter(d => d.isCorrect)) {
      await this.faultModel.deleteOne({ userId: new Types.ObjectId(completedTestData.userId), questionId: detail.questionId });
    }

    const results: TestResultsDto = {
      correctCount: details.filter(d => d.isCorrect).length,
      incorrectCount: details.filter(d => !d.isCorrect).length,
      totalQuestions: details.length,
      details
    };
    return results;
  }

  async getFaults(userId: string): Promise<QuestionItem[]> {
    const faults = await this.faultModel.find({ userId: new Types.ObjectId(userId) }).exec();
    const questionIds = faults.map(fault => fault.questionId);
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds } }).exec();
    return questionDocs.flatMap(doc => doc.questions).filter(q => questionIds.includes(q.id));
  }

  async getFaultsTest(userId: string, limit: number, testName: string, category: string): Promise<QuestionItem[]> {
    const faults = await this.faultModel.find({ userId: new Types.ObjectId(userId), testName }).limit(limit).exec();
    const questionIds = faults.map(fault => fault.questionId);
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds }, category }).exec();
    return questionDocs.flatMap(doc => doc.questions).filter(q => questionIds.includes(q.id));
  }

  async countFaults(userId: string): Promise<number> {
    return this.faultModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec();
  }

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

  async getCompletedTests(userId?: string): Promise<any[]> {
    const query = userId ? { userId: new Types.ObjectId(userId) } : {};
    const tests = await this.completedTestModel.find(query).exec();

    const questionIds = tests.flatMap(test => test.questions);
    const questionDocs = await this.questionModel.find({ 'questions.id': { $in: questionIds } }).exec();
    const allQuestions = questionDocs.flatMap(doc => doc.questions);

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
}
