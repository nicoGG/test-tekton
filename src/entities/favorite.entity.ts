import { CoreEntity } from './core.entity';
import { UserEntity } from './user.entity';

export class FavotiteEntity extends CoreEntity {
  user: UserEntity;
}
