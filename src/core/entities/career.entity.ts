import { UserEntity } from 'src/auth/entities';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('career', { schema: 'core' })
export class CareerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign Keys **/
  @OneToMany(() => UserEntity, (user) => user.career)
  users: UserEntity[];

  /** Columns **/
  @Column({
    type: 'varchar',
    name: 'name',
    comment: 'Estado que va a tener el usuario',
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'description',
    comment: 'Descripcion del estado',
  })
  description: string;

  @Column({
    type: 'varchar',
    name: 'max_semester',
    comment: 'La cantidad maxima de semestres que una carrera puede tener',
  })
  max_semester: string;
}
