// src/tests/tests.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { CompletedTestDto } from './dto/completed-test.dto';
import { Question } from 'src/questions/schema/question.schema';
import { TestResultsDto } from './dto/test-results.dto';
import { CompletedTest } from './schemas/completed-test.schema';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('generate')
  async generateTest(@Body() createTestDto: CreateTestDto): Promise<Question[]> {
    return this.testsService.generateTest(createTestDto.userId, createTestDto.numberOfQuestions);
  }

  @Post('complete')
  async saveCompletedTest(@Body() completedTestDto: CompletedTestDto): Promise<TestResultsDto> {
    return this.testsService.saveCompletedTest(completedTestDto);
  }


  @Get('faults/:userId')
  async getFaults(@Param('userId') userId: string): Promise<Question[]> {
    return this.testsService.getFaults(userId);
  }
// En tu controlador de NestJS
@Get('count-faults/:userId')
async getCountFaults(@Param('userId') userId: string): Promise<{count: number}> {
  const count = await this.testsService.countFaults(userId);
  return { count };
}

@Post('faults')
async getFaultsTest(@Body() body: any): Promise<Question[]> {
  const { userId, limit } = body;
  return this.testsService.getFaultsTest(userId, limit);
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


