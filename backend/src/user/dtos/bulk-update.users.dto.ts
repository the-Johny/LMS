import {
  IsArray,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Role } from '@prisma/client';

export class BulkUpdateUsersDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}
