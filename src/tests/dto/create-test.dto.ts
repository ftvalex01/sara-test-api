// src/tests/dto/create-test.dto.ts
import { IsMongoId, IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreateTestDto {
  @IsMongoId()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  numberOfQuestions: number;

  @IsString()
  @IsOptional()
  testName?: string;
}
