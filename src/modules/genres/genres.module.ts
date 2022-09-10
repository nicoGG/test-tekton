import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { Module } from '@nestjs/common';
import { HttpModule, HttpModuleOptions } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule,
		HttpModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => {
				const config: HttpModuleOptions = {
					baseURL: configService.get<string>('HOST_SPOTIFY'),
					timeout: 5000,
					maxRedirects: 5,
				};
				return config;
			},
			inject: [ConfigService],
		}),
	],
	controllers: [GenresController],
	providers: [GenresService],
})
export class GenresModule {
}
