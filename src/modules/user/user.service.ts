import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from './../../common/dtos/pagination.dto';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {
	}

	async findAll(pagination: PaginationDto): Promise<UserEntity[]> {
		const { limit = 10, offset = 0 } = pagination;
		return await this.userRepository.find({
			take: limit,
			skip: offset,
		});
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

	private handleDBException(error: any) {
		if (error.code === '23505') throw new BadRequestException(error.detail);
		throw new InternalServerErrorException(
			'Unexpected error, check server logs',
		);
	}
}
