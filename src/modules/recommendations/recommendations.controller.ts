import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get(':genre')
  getRecommendationsByGenre(@Param('genre') genre: string) {
    return this.recommendationsService.getRecommendationsByGenre(genre);
  }
}
