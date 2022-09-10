import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		configService: ConfigService,
	) {
		super({
			secretOrKey: process.env.JWT_SECRET || configService.get('JWT_SECRET'),
			ignoreExpiration: false,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		});
	}

	async validate({ id, exp, iat }: Record<string, any>) {
		const timeDiff = exp - iat;
		if (timeDiff <= 0) {
			throw new UnauthorizedException('Token expired');
		}
		const user = await this.userRepository.findOneBy({ id });
		if (!user) throw new UnauthorizedException('Unauthorized user');
		return user;
	}
}
