import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProgressService } from './progress.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
