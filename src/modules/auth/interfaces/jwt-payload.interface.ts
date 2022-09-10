export interface JwtPayload {
	id: string;
	user?: string;
	email?: string;
	expiration?: Date;
}
