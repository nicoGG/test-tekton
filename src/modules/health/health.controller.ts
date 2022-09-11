import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { SpotifyGuard } from '../auth/guards/spotify-access.guard';

@Controller('health')
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	@Get()
	@UseGuards(SpotifyGuard)
	getAllGenres() {
		return this.healthService.getHealthResponse();
	}
}
