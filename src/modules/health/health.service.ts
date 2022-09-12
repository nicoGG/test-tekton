import { Injectable } from '@nestjs/common';
import { HealthInterface } from './interfaces';

@Injectable()
export class HealthService {
	getHealthResponse(): HealthInterface {
		const data = process.env;
		console.log(data.DB_HOST, data.DB_PORT, data.DB_USER, data.DB_PASSWORD, data.DB_DATABASE);
		return { status: 'ok' };
	}
}
