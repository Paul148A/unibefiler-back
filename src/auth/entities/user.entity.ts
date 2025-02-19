import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from './rol.entity';
import { StatusEntity } from './status.entity';

@Entity('users', { schema: 'auth' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign keys */
  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => StatusEntity, (status) => status.users)
  @JoinColumn({ name: 'status_id' })
  status: StatusEntity;
  
  /** Columns **/
  @Column({
    type: 'varchar',
    name: 'names',
    comment: 'nombre del rol',
  })
  names: string;

  @Column({
    type: 'varchar',
    name: 'last_names',
    comment: 'Descripcion del rol',
  })
  last_names: string;
  
  @Column({
    type: 'varchar',
    name: 'identification',
    comment: 'Descripcion del rol',
  })
  identification: string;
  
  @Column({
    type: 'varchar',
    name: 'email',
    comment: 'Descripcion del rol',
  })
  email: string;

  @Column({
    type: 'varchar',
    name: 'password',
    comment: 'Contraseña del usuario',
  })
  password: string;

  @Column({
    type: 'varchar',
    name: 'password_verification',
    comment: 'Verificar contraseña del usuario',
  })
  password_verification: string;
  
}