// src/tests/tests.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { CompletedTestDto } from './dto/completed-test.dto';
import { Question } from 'src/questions/schema/question.schema';
import { CompletedTest } from './schemas/completed-test.schema';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('generate')
  async generateTest(@Body() createTestDto: CreateTestDto): Promise<Question[]> {
    return this.testsService.generateTest(createTestDto.userId, createTestDto.numberOfQuestions);
  }

  @Post('complete')
  async saveCompletedTest(@Body() completedTestDto: CompletedTestDto): Promise<CompletedTest> {
    return this.testsService.saveCompletedTest(completedTestDto);
  }

  @Get('faults/:userId')
  async getFaults(@Param('userId') userId: string): Promise<Question[]> {
    return this.testsService.getFaults(userId);
  }


  @Post('reset/:userId')
  async resetTests(@Param('userId') userId: string): Promise<{ success: boolean }> {
    return this.testsService.resetCompletedTests(userId);
  }
  
}


