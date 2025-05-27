import { RoleDto } from '../role/role.dto';
import { StatusDto } from '../status/status.dto';

export class UserDto {
  readonly role_id: RoleDto;

  readonly status_id: StatusDto;

  readonly names: string;

  readonly last_names: string;

  readonly identification: string;

  readonly email: string;

  readonly password: string;
}
