/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [ContentController],
  providers: [ContentService, CloudinaryService]
})
export class ContentModule {}
