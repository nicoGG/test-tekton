import { PaginationDto } from './../../common/dtos/pagination.dto';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	getAllUsers(@Query() paginationDto: PaginationDto): Promise<UserEntity[]> {
		return this.userService.findAll(paginationDto);
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
