import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Module } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService, TypeOrmModule],
})
export class UserModule {}
