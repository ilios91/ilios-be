import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class EnvConfig {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  CLERK_SECRET_KEY: string;

  @IsString()
  CLERK_PUBLISHABLE_KEY: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  NODE_ENV: string = 'development';
}

export const validateEnv = (config: Record<string, unknown>) => {
  const validatedConfig = new EnvConfig();
  Object.assign(validatedConfig, config);
  return validatedConfig;
};