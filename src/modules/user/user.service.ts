import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from './../../common/dtos/pagination.dto';
import { BadRequestException, CACHE_MANAGER, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { validate as isUUID } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async findAll(pagination: PaginationDto): Promise<UserEntity[]> {
		const { limit = 10, offset = 0 } = pagination;
		if (limit === 10 && offset === 0) {
			const allUsers = await this.cacheManager.get<string>('allUsers');
			if (allUsers) return JSON.parse(allUsers);
		}
		const usersFound = await this.userRepository.find({
			take: limit,
			skip: offset,
			order: { id: 'DESC' },
		});
		await this.cacheManager.set('allUsers', JSON.stringify(usersFound), { ttl: 300 });
		return usersFound;
	}

	async findOne(id: string): Promise<UserEntity> {
		if (!isUUID(id)) throw new BadRequestException('Bad id format');
		const user = await this.userRepository.findOneBy({ id });
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
		try {
			const user = this.userRepository.create(createUserDto);
			await this.userRepository.save(user);
			return user;
		} catch (error) {
			this.handleDBException(error);
		}
	}

	async updateUserFavorites(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
		try {
			const user = await this.findOne(id);
			if (!user) throw new NotFoundException('User not found');
			const favs = updateUserDto.favorites.map(fav => fav.toLowerCase());
			if (favs.length > 5) throw new BadRequestException('Max 5 favorites');
			user.favorites = favs;
			await this.userRepository.save(user);
			return user;
		} catch (error) {
			this.handleDBException(error);
		}
	}

	private handleDBException(error: any) {
		if (error.code === '23505') throw new BadRequestException(error.detail);
		if (error?.message == 'User not found') throw new NotFoundException(error.message);
		throw new InternalServerErrorException('Unexpected error, check server logs');
	}
}
