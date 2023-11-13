import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const conigService = app.get(ConfigService);
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:5173', // Update with your React frontend URL
    credentials: true,
  };

  app.useGlobalPipes(
    new ValidationPipe({
      // transform: true,
      // forbidUnknownValues: true,
      // whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors(corsOptions);
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(conigService.get('PORT'));
}
bootstrap();
