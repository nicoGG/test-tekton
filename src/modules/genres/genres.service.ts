import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AxiosRequestHeaders } from 'axios';
import { axiosGenreResponse, GenreType } from './interfaces';
import { Cache } from 'cache-manager';

@Injectable()
export class GenresService {
	constructor(private readonly httpService: HttpService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	async getAllGenres(): Promise<Observable<GenreType[]>> {
		const redisGenres = await this.cacheManager.get<string>('genres');
		const redisToken = await this.cacheManager.get<string>('spotify_access_token');
		if (redisGenres) {
			const typed = JSON.parse(redisGenres) as GenreType[];
			return new Observable(observer => {
				observer.next(typed);
				observer.complete();
			});
		}
		const headers: AxiosRequestHeaders = { Authorization: `Bearer ${redisToken}` },
			cfg = { headers };
		return this.httpService.get<axiosGenreResponse>('/recommendations/available-genre-seeds', cfg).pipe(
			catchError(err => {
				if (err?.response?.status === 401) throw new UnauthorizedException(err?.response?.statusText);
				throw new HttpException(err, err?.response?.status);
			}),
			map(response => {
				this.cacheManager.set('genres', JSON.stringify(response.data.genres), { ttl: 7200 });
				return response.data.genres;
			}),
		);
	}
}
