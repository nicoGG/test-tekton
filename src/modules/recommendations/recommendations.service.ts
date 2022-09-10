import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { Convert, CustomRecommendation, ResponseRecommendation } from './entities/recommendation.entity';

@Injectable()
export class RecommendationsService {
	constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {
	}

	getRecommendationsByGenre(genre: string): Observable<AxiosResponse<any>> {
		const headers: AxiosRequestHeaders = {
			Authorization: `Bearer ${this.configService.get('TOKEN_SPOTIFY')}`,
		};
		return this.httpService
			.get(`/recommendations?seed_genres=${genre}`, {
				headers,
			})
			.pipe(map(response => response.data));
	}

	getRecommendations(genres: string): Observable<CustomRecommendation> {
		const headers: AxiosRequestHeaders = {
			Authorization: `Bearer ${this.configService.get('TOKEN_SPOTIFY')}`,
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
						return Convert.responseRecommendationToCustomRecommendation(response.data);
					}
				}));
	}
}
