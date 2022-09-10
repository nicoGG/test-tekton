import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { CustomRecommendation } from './entities/recommendation.entity';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
	constructor(private readonly recommendationsService: RecommendationsService) {
	}

	@Get(':genre')
	@UseGuards(JwtAuthGuard)
	getRecommendationsByGenre(@Param('genre') genre: string) {
		return this.recommendationsService.getRecommendationsByGenre(genre);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	getRecommendations(@Query('genres') genres: string): Observable<CustomRecommendation> {
		return this.recommendationsService.getRecommendations(genres);
	}
}
