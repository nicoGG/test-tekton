import { Controller, Get, UseGuards } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreType } from './interfaces';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('genres')
export class GenresController {
	constructor(private readonly genresService: GenresService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	getAllGenres(): Observable<GenreType[]> {
		return this.genresService.getAllGenres();
	}
}
