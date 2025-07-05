import { IsString } from 'class-validator';

export class CreateDiscussionPostDto {
  @IsString() content: string;
  @IsString() courseId: string;
}

export class CreateReplyDto {
  @IsString() content: string;
  @IsString() postId: string;
}
