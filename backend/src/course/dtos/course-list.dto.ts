import { Expose, Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { CourseResponseDto } from './course-response.dto';

export class CourseListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseResponseDto)
  @Expose()
  courses: CourseResponseDto[];

  @IsNumber()
  @Expose()
  total: number;

  @IsNumber()
  @Expose()
  page: number;

  @IsNumber()
  @Expose()
  limit: number;

  @IsNumber()
  @Expose()
  totalPages: number;
}
