import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schema/question.schema';
import { CreateQuestionDto } from './dto/CreateQuestionDto.dto';
import { CheckAnswersDto } from './dto/CheckAnswersDto.dto';
import { TestResultsDto } from 'src/tests/dto/test-results.dto';


@Injectable()
export class QuestionsService {
  constructor(@InjectModel(Question.name) private QuestionModel: Model<QuestionDocument>) {}

  async findAll(): Promise<Question[]> {
    return this.QuestionModel.find().exec();
  }

  async findOne(id: string): Promise<Question | null> {
    return this.QuestionModel.findById(id).exec();
  }

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const createdTest = new this.QuestionModel(createQuestionDto);
    return createdTest.save();
  }

 
async checkAnswers(answersDto: CheckAnswersDto): Promise<TestResultsDto> {
    let correctCount = 0;
    const details = [];
  
    for (const answer of answersDto.answers) {
      const question = await this.QuestionModel.findById(answer.questionId).exec();
      const isCorrect = question && question.correct_answer === answer.selectedOption;
      correctCount += isCorrect ? 1 : 0;
      
      details.push({
        questionId: answer.questionId,
        correctAnswer: Object.keys(question.options).find(key => question.options[key] === question.correct_answer),
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