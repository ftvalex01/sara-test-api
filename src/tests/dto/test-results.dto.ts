import { IsInt, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class TestResultDetailDto {
  @IsInt()
  readonly questionId: number;

  @IsString()
  readonly correct_answer: string;

  @IsString()
  readonly selectedAnswer: string;

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
