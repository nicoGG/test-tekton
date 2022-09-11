import { GenreType } from './genre.interface';

interface GenreResponse {
	genres: GenreType[];
}

export interface axiosGenreResponse extends GenreResponse {}
