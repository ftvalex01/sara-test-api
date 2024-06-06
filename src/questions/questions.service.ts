import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionCollection, QuestionDocument, QuestionItem } from './schema/question.schema';
import { CreateQuestionDto } from './dto/CreateQuestionDto.dto';
import { CheckAnswersDto } from './dto/CheckAnswersDto.dto';
import { TestResultsDto } from 'src/tests/dto/test-results.dto';

@Injectable()
export class QuestionsService {
  constructor(@InjectModel(QuestionCollection.name) private questionModel: Model<QuestionDocument>) {}

  async findAll(): Promise<QuestionCollection[]> {
    return this.questionModel.find().exec();
  }

  async findOne(id: string): Promise<QuestionCollection | null> {
    return this.questionModel.findById(id).exec();
  }

  async create(createQuestionDto: CreateQuestionDto): Promise<QuestionCollection> {
    const createdQuestion = new this.questionModel(createQuestionDto);
    return createdQuestion.save();
  }

  async findByCategory(category: string): Promise<QuestionItem[]> {
    const questionCollections = await this.questionModel.find({ category }).exec();
    return questionCollections.flatMap(collection => collection.questions);
  }

  async checkAnswers(answersDto: CheckAnswersDto): Promise<TestResultsDto> {
    let correctCount = 0;
    const details = [];

    for (const answer of answersDto.answers) {
      const questionDoc = await this.questionModel.findOne({ 'questions.id': answer.questionId }).exec();
      if (!questionDoc) continue;
      const questionItem = questionDoc.questions.find(q => q.id === answer.questionId);
      if (!questionItem) continue;

      const isCorrect = questionItem.correct_answer === answer.selectedOption;
      correctCount += isCorrect ? 1 : 0;

      details.push({
        questionId: answer.questionId,
        correctAnswer: questionItem.correct_answer,
        selectedAnswer: answer.selectedOption,
        isCorrect: isCorrect
      });
    }

    const results: TestResultsDto = {
      correctCount: correctCount,
      incorrectCount: answersDto.answers.length - correctCount,
      totalQuestions: answersDto.answers.length,
      details: details
    };

    return results;
  }
}
