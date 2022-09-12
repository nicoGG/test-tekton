import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
	BadRequestException,
	CACHE_MANAGER,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { BcryptPassword } from '../../common/utils/hashing';
import axios, { AxiosResponse } from 'axios';
import { Cache } from 'cache-manager';
import { SpotifyInterface } from './interfaces/spotify.interface';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async loginUser(loginDto: LoginDto) {
		const { username, password } = loginDto;
		const redisUser = await this.cacheManager.get<string>(`logged_user_${username}`);
		if (redisUser) return JSON.parse(redisUser);
		const foundUser = await this.userRepository.findOneBy({ username: username });
		if (!foundUser) throw new NotFoundException('User not found');
		if (!(await BcryptPassword.compare(foundUser.password, password))) throw new UnauthorizedException('Invalid password');
		const token = this.createJwt(foundUser).token;
		await this.cacheManager.set(`logged_user_${username}`, JSON.stringify({ token }), { ttl: 150 });
		return { token };
	}

	async getAuthenticatedUser(user: UserEntity) {
		// const redisUser = await this.cacheManager.get<string>(`current_user_${user.id}`);
		// if (redisUser) {
		// 	return JSON.parse(redisUser);
		// } else if (Object.keys(user).length > 0) {
		// 	await this.cacheManager.set(`current_user_${user.id}`, JSON.stringify(user), { ttl: 60 * 60 * 24 });
		// 	return user;
		// }
		return user;
	}

	async registerUser(createUserDto: CreateUserDto) {
		try {
			const foundUser = await this.userRepository.findOneBy({ username: createUserDto.username });
			if (foundUser) throw new UnauthorizedException('User already exists');
			const { password, ...userData } = createUserDto;
			const hashedPass = await BcryptPassword.hash(password, 10);
			const user = this.userRepository.create({ ...userData, password: hashedPass });
			await this.userRepository.save(user);
			delete user.password;
			return { ...user, token: this.createJwt(user).token };
		} catch (error) {
			this.handleDBErrors(error);
		}
	}

	async checkAuthStatus(user: UserEntity) {
		return { ...user, token: this.createJwt(user).token };
	}

	async checkAuthStatusOk(token: string) {
		const payload = await this.verifyAndDecodePayload(token);
		const user = await this.validateJwtPayload(payload);
		if (!user) throw new UnauthorizedException('Invalid token, user not found');
		return { ...user, token: this.createJwt(user).token };
	}

	async verifyAndDecodePayload(token: string): Promise<JwtPayload> {
		const secret = this.configService.get<string>('JWT_SECRET');
		const verified = await this.jwtService.verify(token, { secret });
		return verified as JwtPayload;
	}

	async validateJwtPayload(payload: JwtPayload): Promise<UserEntity> {
		const { id } = payload;
		const user = await this.userRepository.findOneBy({ id });
		if (!user) throw new UnauthorizedException('Could not authenticate. Please try again');
		return user;
	}

	createJwt(user: UserEntity): { data: JwtPayload; token: string } {
		const expiresIn = Number(process.env.JWT_EXPIRES_IN) || this.configService.get('JWT_EXPIRES_IN');
		let expiration: Date | undefined;
		if (expiresIn) {
			expiration = new Date();
			expiration.setDate(expiration.getDate() + expiresIn);
		}
		const data: JwtPayload = {
			id: user.id,
			email: user.email,
			expiration,
		};
		const token = this.jwtService.sign(data);
		return { data, token };
	}

	private handleDBErrors(error: any): never {
		if (error.code === '23505') throw new BadRequestException(error.detail);
		if (error?.message === 'User already exists') throw new UnauthorizedException(error.message);
		throw new InternalServerErrorException('Please check server logs');
	}

	static async validateSpotifyToken(token: string): Promise<boolean> {
		const url = 'https://api.spotify.com/v1/browse/new-releases?country=US&limit=1';
		const config = {
			url,
			headers: { Authorization: `Bearer ${token}` },
			method: 'GET',
		};
		const response = await axios(config);
		return response.status === 200;
	}

	static async getSpotifyToken(): Promise<[string, number]> {
		const authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			method: 'POST',
			headers: {
				Authorization: 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
				'content-type': 'application/x-www-form-urlencoded',
			},
			data: 'grant_type=client_credentials',
		};
		const response: AxiosResponse<SpotifyInterface> = await axios(authOptions);
		if (response.status !== 200) throw new InternalServerErrorException('Spotify login failed');
		const { access_token, expires_in } = response.data;
		return [access_token, expires_in];
	}
}
