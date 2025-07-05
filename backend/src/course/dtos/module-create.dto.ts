import { IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsString()
  courseId: string;
}
