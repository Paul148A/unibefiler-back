import { IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { RoleDto } from '../role/role.dto';
import { StatusDto } from '../status/status.dto';

export class FilterUserDto {
  @Expose()
  readonly id: string;

  @Expose()
  readonly email: string;

  @Expose()
  @IsString()
  readonly last_names: string;

  @Expose()
  @IsString()
  readonly names: string;

  @Expose()
  @IsString()
  readonly identification: string;

  @Expose()
  @Type(() => RoleDto)
  readonly role: RoleDto;

  @Expose()
  @Type(() => StatusDto)
  readonly status: StatusDto;
}
