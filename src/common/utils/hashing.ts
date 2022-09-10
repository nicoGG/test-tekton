import * as bcrypt from 'bcrypt';

// create class for hashing and unhashing passwords
export class BcryptPassword {
	// create hash for password
	static async hash(password: string, saltRounds: number = 10): Promise<string> {
		return await bcrypt.hash(password, saltRounds);
	}

	// compare hash with password
	static async compare(hash: string, password: string): Promise<boolean> {
		return await bcrypt.compare(password, hash);
	}
}
