import { CACHE_MANAGER, CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Cache } from 'cache-manager';

// try {
//     if (!(await AuthService.validateSpotifyToken(process.env.SPOTIFY_ACCESS_TOKEN))) {
//         throw new Error('You need to be authenticated to spotify to access this resource');
//     }
//     const response = await AuthService.getSpotifyToken();
//     console.log('RESPONSE', response);
// } catch (error) {
//     return new InternalServerErrorException(error.message);
// }

@Injectable()
export class SpotifyGuard implements CanActivate {
	constructor(private reflector: Reflector, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	private async checkToken(token: string) {
		return await AuthService.validateSpotifyToken(token);
	}

	private async getNewToken() {
		return await AuthService.getSpotifyToken();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const token = await this.cacheManager.get<string>('spotify_access_token');
		if (token) return true;
		const [newToken, expiresIn] = await this.getNewToken();
		await this.cacheManager.set('spotify_access_token', newToken, { ttl: expiresIn });
		return !!newToken;
		// try {
		// 	const isTokenOk = await this.checkToken(token);
		// 	if (isTokenOk) {
		// 		return true;
		// 	}
		// } catch (err) {
		// 	const newToken = await this.getNewToken();
		// 	if (newToken) {
		// 		await this.cacheManager.set('spotify_access_token', newToken, { ttl: 3600 });
		// 	}
		// 	return !!newToken;
		// }
	}
}
