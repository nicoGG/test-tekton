import { BadRequestException, CACHE_MANAGER, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AxiosRequestHeaders } from 'axios';
import { Convert, CustomRecommendation, ResponseRecommendation } from './entities/recommendation.entity';
import { Cache } from 'cache-manager';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class RecommendationsService {
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {
	}

	async getRecommendationsByGenre(genre: string, user: UserEntity): Promise<Observable<CustomRecommendation>> {
		const redisToken = await this.cacheManager.get<string>('spotify_access_token');
		const headers: AxiosRequestHeaders = {
			Authorization: `Bearer ${redisToken}`,
		};
		return this.httpService
			.get(`/recommendations?seed_genres=${genre}`, {
				headers,
			})
			.pipe(map(response => {
				if (response.status === 200) {
					this.cacheManager.set('recommendations', JSON.stringify(response.data), { ttl: 7200 });
					return response.data;
				}
				throw new InternalServerErrorException('Something went wrong');
			}));
	}

	async getRecommendations(genres: string, user: UserEntity): Promise<Observable<CustomRecommendation>> {
		const recommendationsByUser = await this.cacheManager.get<string>(`recommendations_${user.id}`);
		if (recommendationsByUser) {
			const typed = JSON.parse(recommendationsByUser) as CustomRecommendation;
			return new Observable((observer) => {
				observer.next(typed);
				observer.complete();
			});
		}
		const redisToken = await this.cacheManager.get<string>('spotify_access_token');
		const headers: AxiosRequestHeaders = {
			Authorization: `Bearer ${redisToken}`,
		};

		// get length of genres
		const genresLength = genres.split(',').length;
		// if length is greater than 5, return an error message
		if (genresLength > 5) throw new BadRequestException('You can only select up to 5 genres');

		return this.httpService
			.get<ResponseRecommendation>(`/recommendations?seed_genres=${genres}`, {
				headers,
			})
			.pipe(
				catchError((err) => {
					if (err?.response?.status === 401) {
						return throwError(err?.response?.statusText);
					}
					return throwError(err);
				}),
				map(response => {
					if (response.status === 200) {
						const parsedResponse = Convert.responseRecommendationToCustomRecommendation(response.data);
						// `recommendations_${user.id}`
						this.cacheManager.set(`recommendations_${user.id}`, JSON.stringify(parsedResponse), { ttl: 30 });

						return parsedResponse;
					}
				}));
	}
}
