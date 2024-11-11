import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  // Mỗi endpoint sẽ thêm tiền tố trong mỗi url
  // nextJS global route prefix
  app.setGlobalPrefix('api', { exclude: [''] });
  // whitelist: tránh trường hợp update thừa thông tin cho người dùng
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // Loại bỏ các trường không có
      forbidNonWhitelisted: true,
    }),
  );

  // Setup cors (nếu gọi api tại phía client)
  //config cors
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
