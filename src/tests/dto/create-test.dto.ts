// src/tests/dto/create-test.dto.ts
import { IsMongoId, IsNumber, Min, Max } from 'class-validator';

export class CreateTestDto {
  @IsMongoId()
  userId: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  numberOfQuestions: number;
}
