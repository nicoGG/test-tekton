import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { Recomendation } from './entities/recommendation.entity';
import { Observable } from 'rxjs';

@Controller('recommendations')
export class RecommendationsController {
	constructor(private readonly recommendationsService: RecommendationsService) {
	}

	@Get(':genre')
	getRecommendationsByGenre(@Param('genre') genre: string) {
		return this.recommendationsService.getRecommendationsByGenre(genre);
	}

	@Get()
	getRecommendations(@Query('genres') genres: string): Observable<Recomendation> {
		return this.recommendationsService.getRecommendations(genres);
	}
}
