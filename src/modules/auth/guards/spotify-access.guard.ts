import { CACHE_MANAGER, CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Cache } from 'cache-manager';

@Injectable()
export class SpotifyGuard implements CanActivate {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	private async checkToken(token: string) {
		return await AuthService.validateSpotifyToken(token);
	}

	private async getNewToken() {
		return await AuthService.getSpotifyToken();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// await this.cacheManager.del('spotify_access_token');
		const token = await this.cacheManager.get<string>('spotify_access_token');
		if (token) return true;
		const [newToken] = await this.getNewToken();
		await this.cacheManager.set('spotify_access_token', newToken, { ttl: 300 });
		return !!newToken;
	}
}
