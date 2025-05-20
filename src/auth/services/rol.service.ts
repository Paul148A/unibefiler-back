import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { RoleEntity } from '../entities';
import { ServiceResponseHttpModel } from '../models/service-response-http.model';
import { AuthRepositoryEnum } from '../enums/repository.enum';
import { plainToInstance } from 'class-transformer';
import { UpdateRoleDto } from '../dto/role/update-rol.dto';
import { FilterRoleDto } from '../dto/role/filter-rol.dto';
import { RoleDto } from '../dto/role/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @Inject(AuthRepositoryEnum.ROLE_REPOSITORY)
    private repository: Repository<RoleEntity>,
  ) {}

  async create(payload: RoleDto): Promise<RoleEntity> {
    const newRole = this.repository.create(payload);
    return await this.repository.save(newRole);
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.repository.find();

    return roles
    
  }

  async findOne(id: string): Promise<RoleEntity> {
    const role = await this.repository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('El rol con el id: ' + id + ' no existe');
    }

    return role;
  }

  async update(id: string, payload: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.repository.preload({ id, ...payload });

    if (!role) {
      throw new NotFoundException('Rol no encontrado para actualizar');
    }

    this.repository.merge(role, payload);
    return await this.repository.save(role);
  }

  async remove(id: string): Promise<RoleEntity> {
    const role = await this.repository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException('Rol no encontrado para eliminar');
    }

    return await this.repository.softRemove(role);
  }

  async removeAll(payload: RoleEntity[]): Promise<RoleEntity[]> {
    return await this.repository.softRemove(payload);
  }
}