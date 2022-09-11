import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
	@IsString({ message: 'Username must be a string' })
	@MinLength(4)
	username: string;

	@IsEmail({ allow_display_name: true }, { message: 'Email must be a valid email' })
	@IsString({ message: 'Email must be a string' })
	email: string;

	@IsString()
	@MinLength(8)
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
	password: string;

	@IsOptional()
	@IsString({ each: true })
	favorites?: string[];
}
