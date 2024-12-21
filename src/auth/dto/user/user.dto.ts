import { RoleEntity } from 'src/auth/entities';
import { StatusEntity } from 'src/auth/entities/status.entity';

export class UserDto {
  readonly roles: RoleEntity[];

  readonly status: StatusEntity[];

  readonly names: string;

  readonly last_names: string;

  readonly identification: string;

  readonly email: string;

  readonly password: string;
}
