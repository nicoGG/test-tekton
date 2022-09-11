import { GenresModule } from './modules/genres/genres.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { HealthModule } from './modules/health/health.module';
import * as Joi from '@hapi/joi';
import * as redisStore from 'cache-manager-redis-store';

@Module({
	imports: [
		CacheModule.register({
			store: redisStore,
			isGlobal: true,
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
			ttl: 1800,
			isCacheableValue: value => {
				return value !== null;
			},
		}),
		UserModule,
		AuthModule,
		GenresModule,
		RecommendationsModule,
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				SESSION_SECRET: Joi.string().required(),
				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.number().required(),
				DB_USER: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_NAME: Joi.string().required(),
				SPOTIFY_CLIENT_ID: Joi.string().required(),
				SPOTIFY_CLIENT_SECRET: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),
				JWT_EXPIRES_IN: Joi.string().required(),
				PORT: Joi.number().default(3000),
				HOST_API: Joi.string().required(),
				HOST_SPOTIFY: Joi.string().required(),
				TOKEN_SPOTIFY: Joi.string().required(),
			}),
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			url: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=public`,
			autoLoadEntities: true,
			synchronize: true,
		}),
		HealthModule,
	],
	providers: [],
})
export class AppModule {}
