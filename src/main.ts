import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const logger = new Logger('Bootstrap');
	const configService = app.get(ConfigService);
	app.setGlobalPrefix('api');
	app.enableCors();
	app.use(
		session({
			secret: configService.get('SESSION_SECRET'),
			resave: false,
			saveUninitialized: false,
		}),
	);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	await app.listen(process.env.PORT || 3000);
	logger.log(`Application listening on port ${process.env.PORT || 3000}`);
}
bootstrap();
