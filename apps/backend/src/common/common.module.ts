import { Module, Global } from '@nestjs/common';
import { DemoService } from './services/demo.service';

@Global()
@Module({
  providers: [DemoService],
  exports: [DemoService],
})
export class CommonModule {}

