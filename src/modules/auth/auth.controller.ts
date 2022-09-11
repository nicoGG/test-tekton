import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { GetUser, Public } from './decorators';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SpotifyGuard } from './guards/spotify-access.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	async generateRandomString(length: number) {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
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
	@UseGuards(SpotifyGuard)
	getCurrentUser(@GetUser() user: UserEntity): Promise<UserEntity> {
		return this.authService.getAuthenticatedUser(user);
	}
}
