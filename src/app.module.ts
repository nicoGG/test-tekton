import { GenresModule } from './modules/genres/genres.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { HealthModule } from './modules/health/health.module';

@Module({
	imports: [
		UserModule,
		AuthModule,
		GenresModule,
		RecommendationsModule,
		ConfigModule.forRoot(),
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
export class AppModule {
}
