import { Module, Global } from '@nestjs/common';
import { DemoService } from './services/demo.service';
import { MonitoringService } from './services/monitoring.service';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Global()
@Module({
  providers: [
    DemoService,
    MonitoringService,
    HttpExceptionFilter,
    LoggingInterceptor,
    TransformInterceptor,
  ],
  exports: [
    DemoService,
    MonitoringService,
    HttpExceptionFilter,
    LoggingInterceptor,
    TransformInterceptor,
  ],
})
export class CommonModule {}
