import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MonitoringService } from './common/services/monitoring.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DemoService } from './common/services/demo.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Check demo mode
  const demoService = app.get(DemoService);
  const isDemoMode = demoService.isEnabled();

  if (isDemoMode) {
    logger.log('🚀 OmniForge running in DEMO MODE - No API keys required!');
  }

  // Enable CORS with production-safe defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : process.env.NODE_ENV === 'production'
    ? [] // No default origins in production - must be set
    : ['http://localhost:3000']; // Dev default

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || process.env.DEMO_MODE === 'true') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(app.get(MonitoringService)));

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  // app.useGlobalInterceptors(new TransformInterceptor()); // Uncomment if you want consistent response format

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger / OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('OmniForge API')
    .setDescription(
      "The world's first open-source, end-to-end Idea → App → Deployment → App Store AI Builder"
    )
    .setVersion('0.1.0')
    .addTag('ideas', 'Idea management and parsing')
    .addTag('projects', 'Project management')
    .addTag('builds', 'Build tracking')
    .addTag('deployments', 'Deployment management')
    .addTag('tokens', 'Design token management')
    .addTag('documents', 'Document processing')
    .addTag('knowledge-base', 'Knowledge base and templates')
    .addTag('search', 'Search operations')
    .addTag('code-review', 'Code review and optimization')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'OmniForge API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Backend API running on http://localhost:${port}/api`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  if (isDemoMode) {
    logger.log(`🎯 DEMO MODE: Visit http://localhost:${port}/api/docs to explore the API`);
  }
}

bootstrap();
