import { PaginationDto } from './../../common/dtos/pagination.dto';
import { Body, CACHE_MANAGER, Controller, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Cache } from 'cache-manager';

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAllUsers(@Query() paginationDto: PaginationDto): Promise<UserEntity[]> {
		return await this.userService.findAll(paginationDto);
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
		return this.userService.createUser(createUserDto);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	updateUserFavorites(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserEntity> {
		return this.userService.updateUserFavorites(id, updateUserDto);
	}
}
