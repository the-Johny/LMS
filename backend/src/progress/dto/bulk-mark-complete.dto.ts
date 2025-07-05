/* eslint-disable prettier/prettier */
import { IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MarkCompleteDto } from './mark-complete.dto';

export class BulkMarkCompleteDto {
  @ApiProperty({ 
    description: 'Array of lesson completion data',
    type: [MarkCompleteDto]
  })
  @IsArray()
  lessons: MarkCompleteDto[];
} 