import { Exclude, Expose } from 'class-transformer';
import { UserDto } from '@auth/dto';

@Exclude()
export class ReadUserDto extends UserDto {
  @Expose()
  readonly id;
  
  @Expose()
  readonly names;
  
  @Expose()
  readonly lastnames;

  @Expose()
  readonly email;

  @Expose()
  readonly roles;

}
