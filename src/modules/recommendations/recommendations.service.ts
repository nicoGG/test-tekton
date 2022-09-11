import {
	BadRequestException,
	CACHE_MANAGER,
	HttpException,
	Inject,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AxiosRequestHeaders } from 'axios';
import { Convert, CustomRecommendation, ResponseRecommendation } from './entities/recommendation.entity';
import { Cache } from 'cache-manager';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class RecommendationsService {
	constructor(private readonly httpService: HttpService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	async getRecommendationsByGenre(genre: string, user: UserEntity): Promise<Observable<CustomRecommendation>> {
		const redisToken = await this.cacheManager.get<string>('spotify_access_token');
		const headers: AxiosRequestHeaders = { Authorization: `Bearer ${redisToken}` };
		return this.httpService.get(`/recommendations?seed_genres=${genre}`, { headers }).pipe(
			map(response => {
				if (response.status === 200) {
					this.cacheManager.set('recommendations', JSON.stringify(response.data), { ttl: 7200 });
					return response.data;
				}
				throw new InternalServerErrorException('Something went wrong');
			}),
		);
	}

	async getRecommendations(genres: string, user: UserEntity): Promise<Observable<CustomRecommendation>> {
		const redisUser = await this.cacheManager.get<string>(`current_user_${user.id}`);
		const recommendationsByUser = await this.cacheManager.get<string>(`recommendations_${user.id}`);
		if (recommendationsByUser && JSON.parse(redisUser).favorites.length < user.favorites.length) {
			const typed = JSON.parse(recommendationsByUser) as CustomRecommendation;
			return new Observable(observer => {
				observer.next(typed);
				observer.complete();
			});
		}
		const redisToken = await this.cacheManager.get<string>('spotify_access_token');
		const headers: AxiosRequestHeaders = { Authorization: `Bearer ${redisToken}` };
		const genresLength = genres.split(',').length;
		if (genresLength > 5) throw new BadRequestException('You can only select up to 5 genres');
		return this.httpService.get<ResponseRecommendation>(`/recommendations?seed_genres=${genres}`, { headers }).pipe(
			catchError(err => {
				if (err?.response?.status === 401) throw new UnauthorizedException(err?.response?.statusText);
				throw new HttpException(err?.response?.statusText, err?.response?.status);
			}),
			map(response => {
				if (response.status === 200) {
					const parsedResponse = Convert.responseRecommendationToCustomRecommendation(response.data);
					this.cacheManager.set(`recommendations_${user.id}`, JSON.stringify(parsedResponse), { ttl: 30 });
					return parsedResponse;
				}
			}),
		);
	}
}
