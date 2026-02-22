import { Module } from '@nestjs/common';
import { BuilderController } from './builder.controller';
import { HuggingFaceModule } from '../huggingface/huggingface.module';

@Module({
  imports: [HuggingFaceModule],
  controllers: [BuilderController],
})
export class BuilderModule {}
