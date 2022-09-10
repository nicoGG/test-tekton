// To parse this data:
//
//   import { Convert, Recomendation } from "./file";
//
//   const recomendation = Convert.toRecomendation(json);

export interface Recomendation {
	tracks: Track[];
	seeds: Seed[];
}

export interface Seed {
	initialPoolSize: number;
	afterFilteringSize: number;
	afterRelinkingSize: number;
	id: string;
	type: string;
	href: null;
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

// Converts JSON strings to/from your types
export class Convert {
	public static toRecomendation(json: string): Recomendation {
		return JSON.parse(json);
	}

	public static recomendationToJson(value: Recomendation): string {
		return JSON.stringify(value);
	}
}
