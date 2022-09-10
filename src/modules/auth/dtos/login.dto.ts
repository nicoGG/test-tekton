import { IsString, Matches } from 'class-validator';

export class LoginDto {
	@IsString()
	username: string;

	@IsString()
	@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'The password must have an uppercase, lowercase and a number',
	})
	password: string;
}
