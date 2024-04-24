// src/tests/dto/test-results.dto.ts
import { IsInt, Min, IsArray, ValidateNested, IsMongoId, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class TestResultDetailDto {
  @IsMongoId()
  readonly questionId: string;

  @IsString()
  readonly correctAnswer: string;

  @IsString()
  readonly selectedAnswer: string;

  @IsInt()
  readonly isCorrect: boolean;
}

export class TestResultsDto {
  @IsInt()
  readonly correctCount: number;

  @IsInt()
  readonly incorrectCount: number;

  @IsInt()
  readonly totalQuestions: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestResultDetailDto)
  readonly details: TestResultDetailDto[];
}
