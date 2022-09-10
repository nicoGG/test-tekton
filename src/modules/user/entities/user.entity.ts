import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { CoreEntity } from '../../../entities/core.entity';

@Entity('user')
export class UserEntity extends CoreEntity {
	@Column({ type: 'text', unique: true })
	username: string;

	@Column({ type: 'text', unique: true, nullable: true })
	email: string;

	@Column({ type: 'text' })
	password: string;

	@Column({ type: 'text', array: true, default: [] })
	favorites: string[];

	@BeforeInsert()
	checkFieldsBeforeInsert(): void {
		this.email = this.email.toLowerCase().trim();
	}

	@BeforeUpdate()
	checkFieldsBeforeUpdate() {
		this.checkFieldsBeforeInsert();
	}
}
