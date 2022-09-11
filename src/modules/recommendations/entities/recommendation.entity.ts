import * as _ from 'lodash';

export interface CustomSeed extends Pick<Seed, 'type' | 'id'> {}

export const pickFromTrack = 'uri' || 'name' || 'preview_url' || 'id' || 'artists' || 'duration_ms';

export interface CustomTrack extends Pick<Track, typeof pickFromTrack> {
	album: Partial<CustomAlbum>;
}

export interface ResponseRecommendation {
	tracks: Track[];
	seeds: Seed[];
}

export interface CustomRecommendation {
	principalTrack: CustomTrack;
	tracks: CustomTrack[];
	genres: CustomSeed[];
}

export interface Seed {
	initialPoolSize: number;
	afterFilteringSize: number;
	afterRelinkingSize: number;
	id: string;
	type: string;
}

export interface Track {
	album: Album;
	artists: Artist[];
	available_markets: string[];
	disc_number: number;
	duration_ms: number;
	explicit: boolean;
	external_ids: ExternalIDS;
	external_urls: ExternalUrls;
	href: string;
	id: string;
	is_local: boolean;
	name: string;
	popularity: number;
	preview_url: null | string;
	track_number: number;
	type: TrackType;
	uri: string;
}

export const omitFromAlbum = 'available_markets' || 'type' || 'total_tracks' || 'release_date_precision' || 'album_type';

export interface CustomAlbum extends Omit<Album, typeof omitFromAlbum> {}

export interface Album {
	album_type: AlbumType;
	artists: Artist[];
	available_markets: string[];
	external_urls: ExternalUrls;
	href: string;
	id: string;
	images: Image[];
	name: string;
	release_date: Date;
	release_date_precision: ReleaseDatePrecision;
	total_tracks: number;
	type: AlbumTypeEnum;
	uri: string;
}

export enum AlbumType {
	Album = 'ALBUM',
	Compilation = 'COMPILATION',
	Single = 'SINGLE',
}

export interface Artist {
	external_urls: ExternalUrls;
	href: string;
	id: string;
	name: string;
	type: ArtistType;
	uri: string;
}

export interface ExternalUrls {
	spotify: string;
}

export enum ArtistType {
	Artist = 'artist',
}

export interface Image {
	height: number;
	url: string;
	width: number;
}

export enum ReleaseDatePrecision {
	Day = 'day',
}

export enum AlbumTypeEnum {
	Album = 'album',
}

export interface ExternalIDS {
	isrc: string;
}

export enum TrackType {
	Track = 'track',
}

export class Convert {
	private static toRR(track: Partial<CustomTrack>): CustomTrack {
		return <CustomTrack>_.pick(track, typeof pickFromTrack && 'album');
	}

	private static quitAMarketsFromTrack(track: CustomTrack): CustomTrack {
		return {
			...track,
			album: _.omit(track.album, omitFromAlbum),
		};
	}

	public static responseRecommendationToCustomRecommendation(res: ResponseRecommendation): CustomRecommendation {
		const sample = _.sample(res.tracks);
		const principal = this.quitAMarketsFromTrack(sample);
		const tracks = _.without(res.tracks, sample).map(s => this.toRR(this.quitAMarketsFromTrack(s)));
		const seeds: CustomSeed[] = _.map(res.seeds, (seed: Seed) => _.pick(seed, ['type', 'id']));
		return {
			tracks,
			principalTrack: this.toRR(principal),
			genres: seeds,
		};
	}

	public static recommendationToJson(value: ResponseRecommendation): string {
		return JSON.stringify(value);
	}
}
