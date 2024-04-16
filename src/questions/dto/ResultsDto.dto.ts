// src/questions/dto/results.dto.ts
import { IsInt, Min, IsArray, ValidateNested, IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class ResultDetailDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly questionId: string;

  @IsNotEmpty()
  @IsString()
  readonly correctAnswer: string;

  @IsNotEmpty()
  @IsString()
  readonly selectedAnswer: string;

  @IsNotEmpty()
  readonly isCorrect: boolean;
}

export class ResultsDto {
  @IsInt()
  @Min(0)
  readonly correctCount: number;

  @IsInt()
  @Min(0)
  readonly incorrectCount: number;

  @IsInt()
  @Min(1)
  readonly totalQuestions: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultDetailDto)
  readonly details: ResultDetailDto[];
}
