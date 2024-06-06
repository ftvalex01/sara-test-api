import { ValidateNested, IsArray, IsNotEmpty, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsNotEmpty()
  @IsInt()
  readonly questionId: number;

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
