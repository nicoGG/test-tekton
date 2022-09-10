import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { Recomendation } from './entities/recommendation.entity';

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

	getRecommendations(genres: string): Observable<Recomendation> {
		const headers: AxiosRequestHeaders = {
			Authorization: `Bearer ${this.configService.get('TOKEN_SPOTIFY')}`,
		};

		return this.httpService
			.get<Recomendation>(`/recommendations?seed_genres=${genres}`, {
				headers,
			})
			.pipe(map(response => response.data));
	}
}
