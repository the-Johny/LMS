import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService],
})
export class ModulesModule {} 