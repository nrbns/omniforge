import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsString()
  @IsOptional()
  REDIS_PORT: string = '6379';

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  NEO4J_URI: string = 'bolt://localhost:7687';

  @IsString()
  @IsOptional()
  NEO4J_USER: string = 'neo4j';

  @IsString()
  @IsOptional()
  NEO4J_PASSWORD?: string;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  CLERK_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  CLERK_PUBLISHABLE_KEY?: string;

  @IsString()
  @IsOptional()
  HUGGINGFACE_API_KEY?: string;

  @IsString()
  @IsOptional()
  OPENAI_API_KEY?: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS?: string;

  @IsString()
  @IsOptional()
  PORT?: string = '3001';

  @IsString()
  @IsOptional()
  DEMO_MODE?: string = 'false';

  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missingVars = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');

    throw new Error(
      `Environment validation failed. Missing or invalid variables: ${missingVars}\n` +
        'Please check your .env file or set DEMO_MODE=true for development.'
    );
  }

  return validatedConfig;
}
