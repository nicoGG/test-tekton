import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { BcryptPassword } from '../../common/utils/hashing';


@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {
	}


	async loginUser(loginDto: LoginDto) {
		const { username, password } = loginDto;
		const foundUser = await this.userRepository.findOneBy({ username: username });
		if (!foundUser) throw new NotFoundException('User not found');
		if (!(await BcryptPassword.compare(foundUser.password, password)))
			throw new UnauthorizedException('Invalid password');

		return {
			// ...foundUser,
			token: this.createJwt(foundUser).token,
		};
	}

	async getAuthenticatedUser(user: UserEntity) {
		const { password, ...userData } = user;
		return user;
	}

	async registerUser(createUserDto: CreateUserDto) {
		try {
			const foundUser = await this.userRepository.findOneBy({
				username: createUserDto.username,
			});
			if (foundUser) throw new UnauthorizedException('User already exists');
			const { password, ...userData } = createUserDto;

			const hashedPass = await BcryptPassword.hash(password, 10);

			const user = this.userRepository.create({
				...userData,
				password: hashedPass,
			});
			await this.userRepository.save(user);
			delete user.password;
			return {
				...user,
				token: this.createJwt(user).token,
			};
		} catch (error) {
			this.handleDBErrors(error);
		}
	}

	async checkAuthStatus(user: UserEntity) {
		return {
			...user,
			token: this.createJwt(user).token,
		};
	}

	async checkAuthStatusOk(token: string) {
		const payload = await this.verifyAndDecodePayload(token);

		const user = await this.validateJwtPayload(payload);
		if (!user) {
			throw new UnauthorizedException('Invalid token, user not found');
		}
		// return user;

		return {
			...user,
			token: this.createJwt(user).token,
		};
	}

	async verifyAndDecodePayload(token: string): Promise<JwtPayload> {
		const secret = this.configService.get('JWT_SECRET');

		const verified = await this.jwtService.verify(token, { secret });

		return verified as JwtPayload;
	}

	async validateJwtPayload(payload: JwtPayload): Promise<UserEntity> {
		const { id } = payload;
		const user = await this.userRepository.findOneBy({ id });
		if (!user) {
			throw new UnauthorizedException(
				'Could not authenticate. Please try again',
			);
		}
		return user;
	}

	createJwt(user: UserEntity): { data: JwtPayload; token: string } {
		const expiresIn = Number(process.env.JWT_EXPIRES_IN) || this.configService.get('JWT_EXPIRES_IN');
		let expiration: Date | undefined;
		if (expiresIn) {
			// set expiration date in days
			expiration = new Date();
			// add 1 day to expiration date
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
		if (error?.message === 'User already exists') {
			// exception user already exists
			throw new UnauthorizedException(error.message);
		}
		throw new InternalServerErrorException('Please check server logs');
	}
}
