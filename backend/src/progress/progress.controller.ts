import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { MarkCompleteDto } from './dto/mark-complete.dto';
import { ApiTags, ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UserProgressDto } from './dto/user-progress.dto';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('mark-complete')
  @ApiBody({ type: MarkCompleteDto })
  @ApiOkResponse({ description: 'Lesson marked as completed successfully' })
  markComplete(@Body() dto: MarkCompleteDto) {
    return this.progressService.markLessonComplete(dto);
  }

  @Get(':enrollmentId')
  @ApiParam({ name: 'enrollmentId', type: String })
  @ApiOkResponse({ type: UserProgressDto, description: 'User progress for the course' })
  getProgress(@Param('enrollmentId') enrollmentId: string) {
    return this.progressService.getUserCourseProgress(enrollmentId);
  }
}
