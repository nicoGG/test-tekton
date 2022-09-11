import * as bcrypt from 'bcrypt';

export class BcryptPassword {
	static async hash(password: string, saltRounds: number = 10): Promise<string> {
		return await bcrypt.hash(password, saltRounds);
	}

	static async compare(hash: string, password: string): Promise<boolean> {
		return await bcrypt.compare(password, hash);
	}
}
