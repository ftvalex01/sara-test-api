import { IsString, IsNotEmpty, IsObject, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CreateQuestionItemDto {
  @IsNotEmpty()
  @IsString()
  readonly question: string;

  @IsNotEmpty()
  @IsObject()
  readonly options: Record<string, string>;

  @IsNotEmpty()
  @IsString()
  readonly correct_answer: string;

  @IsNotEmpty()
  @IsNumber()
  readonly id: number;  // Este id es el proporcionado en el JSON
}

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  readonly category: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionItemDto)
  readonly questions: CreateQuestionItemDto[];
}
