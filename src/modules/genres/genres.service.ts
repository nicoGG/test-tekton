import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AxiosRequestHeaders } from 'axios';
import { axiosGenreResponse, GenreType } from './interfaces';

@Injectable()
export class GenresService {
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
	}

	getAllGenres(): Observable<GenreType[]> {
		const headers: AxiosRequestHeaders = {
			Authorization: `Bearer ${this.configService.get('TOKEN_SPOTIFY')}`,
		}, cfg = { headers };

		return this.httpService
			.get<axiosGenreResponse>('/recommendations/available-genre-seeds', cfg)
			.pipe(
				catchError((err) => {
					if (err?.response?.status === 401) {
						return throwError(err?.response?.statusText);
					}
					return throwError(err);
				}),
				map((response) => response.data.genres),
			);

	}
}
