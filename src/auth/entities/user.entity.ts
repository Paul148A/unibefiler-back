import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from './rol.entity';
import { StatusEntity } from './status.entity';
import { RecordEntity } from 'src/upload_files/entities/record.entity';

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

  @OneToOne(() => RecordEntity, (record) => record.user)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;
  
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
}