/* eslint-disable prettier/prettier */

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('roles', {schema: 'auth'})
export class RoleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Foreign Keys **/
    @OneToMany(() => UserEntity, user => user.role)
    users: UserEntity[];

    /** Columns **/
    @Column({
        type: 'varchar',
        name: 'name',
        comment: 'nombre del rol',
    })
    name: string;

    @Column({
        type: 'varchar',
        name: 'description',
        comment: 'Descripcion del rol',
    })
    description: string;
}
