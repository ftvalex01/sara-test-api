// src/tests/tests.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
  ) {}

  async generateTest(userId: string, numberOfQuestions: number): Promise<Question[]> {
    const completedQuestionsIds = await this.completedTestModel.find({ userId }).distinct('questions');
    const availableQuestions = await this.questionModel.find({ _id: { $nin: completedQuestionsIds } }).limit(numberOfQuestions).exec();
    return availableQuestions;
}

  async saveCompletedTest(completedTestData: CompletedTestDto): Promise<TestResultsDto> {
    const newCompletedTest = new this.completedTestModel({
      userId: completedTestData.userId,
      questions: completedTestData.answers.map(answer => answer.questionId),
      answers: completedTestData.answers.map(answer => answer.selectedOption),
      createdAt: new Date(),
      testName: completedTestData.testName,
    });
    await newCompletedTest.save();

    const questions = await this.questionModel.find({ '_id': { $in: completedTestData.answers.map(a => a.questionId) } }).exec();
    const details = completedTestData.answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question?.correct_answer === answer.selectedOption;
      return { questionId: answer.questionId, correctAnswer: question?.correct_answer, selectedAnswer: answer.selectedOption, isCorrect };
    });

    const faults = details.filter(d => !d.isCorrect).map(faultyAnswer => ({
      userId: completedTestData.userId,
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

    details.filter(d => d.isCorrect).forEach(async (detail) => {
      await this.faultModel.deleteOne({ userId: completedTestData.userId, questionId: detail.questionId });
    });

    const results = {
      correctCount: details.filter(d => d.isCorrect).length,
      incorrectCount: details.filter(d => !d.isCorrect).length,
      totalQuestions: details.length,
      details
    };
    return results;
  }

  async getFaults(userId: string): Promise<Question[]> {
    const faults = await this.faultModel.find({ userId }).exec();
    const questionIds = faults.map(fault => fault.questionId);
    return this.questionModel.find({ _id: { $in: questionIds } }).exec();
  }

  async getFaultsTest(userId: string, limit: number, testName: string): Promise<Question[]> {
    const faults = await this.faultModel.find({ userId }).limit(limit).exec();
    const questionIds = faults.map(fault => fault.questionId);
    return this.questionModel.find({ _id: { $in: questionIds } }).exec();
  }

  async countFaults(userId: string): Promise<number> {
    return this.faultModel.countDocuments({ userId }).exec();
  }

  async resetCompletedTests(userId: string): Promise<{ success: boolean }> {
    try {
      await this.completedTestModel.deleteMany({ userId });
      await this.faultModel.deleteMany({ userId });
      return { success: true };
    } catch (error) {
      console.error('Error resetting completed tests:', error);
      return { success: false };
    }
  }

  async getCompletedTests(userId?: string): Promise<any[]> {
    const query = userId ? { userId } : {};
    const tests = await this.completedTestModel.find(query)
      .populate({
        path: 'questions',
        model: 'Question',
        select: 'question options correct_answer'
      })
      .exec();

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
