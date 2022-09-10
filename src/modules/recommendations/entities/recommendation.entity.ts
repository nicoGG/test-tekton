// To parse this data:
//
//   import { Convert, Recomendation } from "./file";
//
//   const recomendation = Convert.toRecomendation(json);
// import lodash
import * as _ from 'lodash';

export interface CustomSeed extends Pick<Seed, 'type' | 'id'> {
}

// interface CustomTrack with type, uri, track_number, name, popularity, id, album, artists, disk_number, duration_ms.
export interface CustomTrack extends Pick<Track, 'type' | 'uri' | 'track_number' | 'name' | 'popularity' | 'id' | 'album' | 'artists' | 'disc_number' | 'duration_ms'> {
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
	public static responseRecommendationToCustomRecommendation(res: ResponseRecommendation): CustomRecommendation {
		// get one random track from the list of tracks
		const principal = _.sample(res.tracks);
		// get the list of tracks without the principal track
		const tracks = _.without(res.tracks, principal);
		// get the list of seeds in the format {type, id}
		const seeds: CustomSeed[] = _.map(res.seeds, (seed: Seed) => _.pick(seed, ['type', 'id']));


		return {
			tracks,
			principalTrack: principal,
			genres: seeds,
		};
	}

	public static recommendationToJson(value: ResponseRecommendation): string {
		return JSON.stringify(value);
	}
}
