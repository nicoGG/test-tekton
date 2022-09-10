import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { GetUser, Public } from './decorators';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {
	}

	@Public()
	@Post('login')
	login(@Body() loginDto: LoginDto) {
		return this.authService.loginUser(loginDto);
	}

	@Public()
	@Post('register')
	register(@Body() createUserDto: CreateUserDto) {
		return this.authService.registerUser(createUserDto);
	}

	@Get('check-status')
	@UseGuards(AuthGuard('jwt'))
	checkAuthStatus(@GetUser() user: UserEntity) {
		return this.authService.checkAuthStatus(user);
	}

	@Get('/profile')
	@UseGuards(JwtAuthGuard)
	getCurrentUser(@GetUser() user: UserEntity): Promise<UserEntity> {
		return this.authService.getAuthenticatedUser(user);
	}
}
