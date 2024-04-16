// src/questions/dto/create-question.dto.ts
import { IsString, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  readonly question: string;

  @IsArray()
  @ArrayMinSize(4)
  readonly options: string[];

  @IsNotEmpty()
  @IsString()
  readonly answer: string;
}
