import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Question } from './schema/question.schema';
import { CheckAnswersDto } from './dto/CheckAnswersDto.dto';
import { CreateQuestionDto } from './dto/CreateQuestionDto.dto';


@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionService: QuestionsService) {}

  @Get()
  async findAll(): Promise<Question[]> {
    return this.questionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Question> {
    return this.questionService.findOne(id);
  }

  @Post()
  async create(@Body() createTestDto: CreateQuestionDto): Promise<Question> {
    return this.questionService.create(createTestDto);
  }

  @Post('check-answers')
  async checkAnswers(@Body() answersDto: CheckAnswersDto) {
    return this.questionService.checkAnswers(answersDto);
  }
}