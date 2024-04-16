// src/questions/dto/check-answers.dto.ts
import { ValidateNested, IsArray, IsNotEmpty, IsMongoId, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly questionId: string;

  @IsNotEmpty()
  @IsString()
  readonly selectedOption: string;
}

export class CheckAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  readonly answers: AnswerDto[];
}
