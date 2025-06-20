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
import { SemesterEntity } from 'src/core/entities/semester.entity';
import { CareerEntity } from 'src/core/entities/career.entity';

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

  @ManyToOne(() => SemesterEntity, (status) => status.users)
  @JoinColumn({ name: 'status_id' })
  semester: SemesterEntity;

   @ManyToOne(() => CareerEntity, (status) => status.users)
  @JoinColumn({ name: 'status_id' })
  career: CareerEntity;
  
  @OneToOne(() => RecordEntity, (record) => record.user,{
    cascade: true,
    eager: true
  })
  record: RecordEntity;

  /** Columns **/
  @Column({
    type: 'varchar',
    name: 'names',
    comment: 'nombre del usuario',
  })
  names: string;

  @Column({
    type: 'varchar',
    name: 'last_names',
    comment: 'Apellidos del usuario',
  })
  last_names: string;
  
  @Column({
    type: 'varchar',
    name: 'identification',
    comment: 'Numero de cedula del usuario',
  })
  identification: string;
  
  @Column({
    type: 'varchar',
    name: 'email',
    comment: 'Correo del usuario',
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
    name: 'is_approved',
    comment: 'Si el estudiante es homologado o no',
  })
  is_approved: boolean;
}