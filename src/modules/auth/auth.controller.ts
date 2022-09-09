import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Get('check-status')
  @UseGuards(AuthGuard())
  checkAuthStatus(@GetUser() user: UserEntity) {
    return this.authService.checkAuthStatus(user);
  }
}
