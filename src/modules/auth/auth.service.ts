import { CreateUserDto } from './../user/dto/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './../../entities/user.entity';
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
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginUser(loginDto: LoginDto) {
    const { user, password } = loginDto;
    const foundUser = await this.userRepository.findOneBy({ user: user });
    if (!foundUser) throw new NotFoundException('User not found');
    if (!(await bcrypt.comparePassword(foundUser.password, password)))
      throw new UnauthorizedException('Invalid password');
    return {
      ...foundUser,
      token: this.createJwt(foundUser).token,
    };
  }

  async registerUser(createUserDto: CreateUserDto) {
    try {
      const foundUser = await this.userRepository.findOneBy({
        user: createUserDto.user,
      });
      if (foundUser) throw new UnauthorizedException('User already exists');
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashPassword(password),
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

  async validateJwtPayload(payload: JwtPayload): Promise<UserEntity> {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  createJwt(user: UserEntity): { data: JwtPayload; token: string } {
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');
    let expiration: Date | undefined;
    if (expiresIn) {
      expiration = new Date();
      expiration.setTime(expiration.getTime() + expiresIn * 1000);
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
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
