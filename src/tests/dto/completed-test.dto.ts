import { IsMongoId, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerDto } from '../../questions/dto/CheckAnswersDto.dto';

export class CompletedTestDto {
  @IsMongoId()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @IsString()
  @IsOptional()
  testName?: string;
}
