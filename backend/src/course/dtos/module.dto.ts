export class CreateModuleDto {
  title: string;
  courseId: string;
}

export class UpdateModuleDto {
  title?: string;
}

export class ModuleResponseDto {
  id: string;
  title: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
  };
  lessons?: LessonResponseDto[];
  lessonCount?: number;
}
