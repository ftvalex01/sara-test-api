import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { QuestionItem } from 'src/questions/schema/question.schema';
import { TestResultsDto } from './dto/test-results.dto';
import { CompletedTestDto } from './dto/completed-test.dto';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('generate')
  async generateTest(@Body() createTestDto: CreateTestDto): Promise<QuestionItem[]> {
    return this.testsService.generateTest(createTestDto.userId, createTestDto.numberOfQuestions, createTestDto.category);
  }

  @Get('available-questions')
  async getAvailableQuestions(@Query('userId') userId: string, @Query('category') category: string): Promise<QuestionItem[]> {
    return this.testsService.getAvailableQuestions(userId, category);
  }

  @Post('complete')
  async saveCompletedTest(@Body() completedTestDto: CompletedTestDto): Promise<TestResultsDto> {
    return this.testsService.saveCompletedTest(completedTestDto);
  }

  @Get('faults/:userId')
  async getFaults(@Param('userId') userId: string): Promise<QuestionItem[]> {
    return this.testsService.getFaults(userId);
  }

  @Get('count-faults/:userId')
  async getCountFaults(@Param('userId') userId: string): Promise<{ count: number }> {
    const count = await this.testsService.countFaults(userId);
    return { count };
  }

  @Post('faults')
  async getFaultsTest(@Body() body: any): Promise<QuestionItem[]> {
    const { userId, limit, testName, category } = body;
    return this.testsService.getFaultsTest(userId, limit, testName, category);
  }

  @Post('reset/:userId')
  async resetTests(@Param('userId') userId: string): Promise<{ success: boolean }> {
    return this.testsService.resetCompletedTests(userId);
  }

  @Get('completed/:userId')
  async getCompletedTests(@Param('userId') userId: string) {
    return this.testsService.getCompletedTests(userId);
  }
}
