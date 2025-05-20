import { StatusEntity } from "src/auth/entities/status.entity";
import { UserDto } from "./user.dto";
import { Exclude, Expose } from 'class-transformer';
import { RoleEntity } from "src/auth/entities";

@Exclude()
export class ReadUserDto extends UserDto {
  @Expose()
  readonly id;
  
  @Expose()
  readonly names;

  @Expose()
  readonly identification;
  
  @Expose()
  readonly lastnames;

  @Expose()
  readonly email;

  @Expose()
  readonly password;

  @Expose()
  readonly status: StatusEntity;

  @Expose()
  readonly roles: RoleEntity;

}
