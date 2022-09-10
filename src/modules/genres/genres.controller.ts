import { Controller, Get } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreType } from './interfaces';
import { Observable } from 'rxjs';

@Controller('genres')
export class GenresController {
	constructor(private readonly genresService: GenresService) {
	}

	@Get()
	getAllGenres(): Observable<GenreType[]> {
		return this.genresService.getAllGenres();
	}
}
