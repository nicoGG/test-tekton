import { Injectable } from '@nestjs/common';
import { HealthInterface } from './interfaces';

@Injectable()
export class HealthService {
	getHealthResponse(): HealthInterface {
		return {
			status: 'ok',
		};
	}
}
