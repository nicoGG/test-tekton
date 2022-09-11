import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { CustomRecommendation } from './entities/recommendation.entity';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SpotifyGuard } from '../auth/guards/spotify-access.guard';
import { GetUser } from '../auth/decorators';
import { UserEntity } from '../user/entities/user.entity';

@Controller('recommendations')
export class RecommendationsController {
	constructor(private readonly recommendationsService: RecommendationsService) {}

	@Get(':genre')
	@UseGuards(JwtAuthGuard)
	@UseGuards(SpotifyGuard)
	getRecommendationsByGenre(@GetUser() user: UserEntity, @Param('genre') genre: string) {
		return this.recommendationsService.getRecommendationsByGenre(genre, user);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@UseGuards(SpotifyGuard)
	getRecommendations(@GetUser() user: UserEntity, @Query('genres') genres: string): Promise<Observable<CustomRecommendation>> {
		return this.recommendationsService.getRecommendations(genres, user);
	}
}
