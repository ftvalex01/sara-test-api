import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionCollection } from './schema/question.schema';
import { CheckAnswersDto } from './dto/CheckAnswersDto.dto';
import { CreateQuestionDto } from './dto/CreateQuestionDto.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionService: QuestionsService) {}

  @Get()
  async findAll(): Promise<QuestionCollection[]> {
    return this.questionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<QuestionCollection> {
    return this.questionService.findOne(id);
  }

  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto): Promise<QuestionCollection> {
    return this.questionService.create(createQuestionDto);
  }


  @Post('check-answers')
  async checkAnswers(@Body() answersDto: CheckAnswersDto) {
    return this.questionService.checkAnswers(answersDto);
  }
}
