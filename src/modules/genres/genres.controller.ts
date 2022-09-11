import { Controller, Get, UseGuards } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreType } from './interfaces';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SpotifyGuard } from '../auth/guards/spotify-access.guard';

@Controller('genres')
export class GenresController {
	constructor(private readonly genresService: GenresService) {
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@UseGuards(SpotifyGuard)
	getAllGenres(): Promise<Observable<GenreType[]>> {
		return this.genresService.getAllGenres();
	}
}
