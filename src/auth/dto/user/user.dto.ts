import { RoleDto } from '../role/role.dto';
import { StatusDto } from '../status/status.dto';

export class UserDto {
  readonly role: RoleDto;

  readonly status: StatusDto;

  readonly names: string;

  readonly last_names: string;

  readonly identification: string;

  readonly email: string;

  readonly password: string;
}
