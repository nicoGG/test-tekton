import { PaginationDto } from './../../common/dtos/pagination.dto';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {
	}

	@Get()
	@UseGuards(AuthGuard())
	getAllUsers(@Query() paginationDto: PaginationDto): Promise<UserEntity[]> {
		return this.userService.findAll(paginationDto);
	}

	@Post()
	createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
		return this.userService.createUser(createUserDto);
	}
}
