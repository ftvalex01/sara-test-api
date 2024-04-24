import { IsString, IsObject, IsNotEmpty } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  readonly question: string;

  @IsObject()
  @IsNotEmpty()
  readonly options: Record<string, string>;

  @IsNotEmpty()
  @IsString()
  readonly answer: string;
}
