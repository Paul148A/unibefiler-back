/* eslint-disable prettier/prettier */

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('status', { schema: 'core' })
export class StatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign Keys **/
  @OneToMany(() => UserEntity, (user) => user.role)
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
}
