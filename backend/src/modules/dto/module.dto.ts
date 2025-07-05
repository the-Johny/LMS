import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introduction to Programming' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsString()
  courseId: string;
}

export class UpdateModuleDto {
  @ApiProperty({ example: 'Advanced Programming Concepts' })
  @IsOptional()
  @IsString()
  title?: string;
}

export class ModuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  courseId: string;
} 