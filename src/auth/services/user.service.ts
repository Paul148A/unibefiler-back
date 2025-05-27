import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { AuthRepositoryEnum } from '../enums/repository.enum';
import { UserEntity } from '../entities';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { FilterUserDto } from '../dto/user/filter-user.dto';
import { ReadUserDto } from '../dto/user/read-user.dto';
import { ServiceResponseHttpModel } from '../models/service-response-http.model';
import { plainToInstance } from 'class-transformer';
import { RecordService } from 'src/upload_files/services/record.service';
import { RecordEntity } from 'src/upload_files/entities/record.entity';
import { RolesService } from './rol.service';
import { StatusService } from './status.service';


@Injectable()
export class UsersService {
    constructor(
        @Inject(AuthRepositoryEnum.USER_REPOSITORY)
        private repository: Repository<UserEntity>,
        private readonly recordService: RecordService,
        private readonly rolesService: RolesService,
        private readonly statusService: StatusService
    ) {
    }

    async createUserWithRecord(payload: CreateUserDto): Promise<{ user: UserEntity, record: RecordEntity }> {
        const user = await this.create(payload);

        if (!user) {
            throw new NotFoundException('No se pudo crear el usuario');
        }
        const record = await this.recordService.createRecord(user.id);

        return {
            user,
            record
        };
    }

    async create(payload: CreateUserDto): Promise<UserEntity> {
        const validateRole = await this.rolesService.findOne(payload.role);
        if (!validateRole) {
            throw new NotFoundException('El rol no existe');
        }

        const validateStatus = await this.statusService.findOne(payload.status);
        if (!validateStatus) {
            throw new NotFoundException('El status no existe');
        }

        const newUser = this.repository.create({
            ...payload,
            role: validateRole,
            status: validateStatus,
        });
        return await this.repository.save(newUser);
    }

    async findAll(): Promise<ServiceResponseHttpModel> {
        const relations = { role: true, status: true };

        const response = await this.repository.findAndCount({
            relations,
        });

        return {
            data: response[0],
        };
    }

    async findOne(id: string): Promise<FilterUserDto> {
        const user = await this.repository.findOne({
            where: { id },
            relations: { role: true, status: true },
            select: { password: false },
        });

        if (!user) {
            throw new NotFoundException('El usuario con el id: ' + id + ' no existe');
        }

        const userDto = plainToInstance(FilterUserDto, user, {
            excludeExtraneousValues: true
        });

        return userDto;
    }

    async findByIdentification(identification: string): Promise<FilterUserDto> {
        const user = await this.repository.findOne({
            where: { identification },
            select: { password: false },
        });

        if (!user) {
            throw new NotFoundException('No existe un usuario con la identificación: ' + identification);
        }

        const userDto = plainToInstance(FilterUserDto, user, {
            excludeExtraneousValues: true
        });

        return userDto;
    }

    async update(id: string, payload: any): Promise<UserEntity> {
        const user = await this.repository.preload({ id, ...payload });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado para actualizar');
        }

        this.repository.merge(user, payload);

        return await this.repository.save(user);
    }

    async remove(id: string): Promise<ReadUserDto> {
        const user = await this.repository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado para eliminar');
        }

        const userDeleted = await this.repository.softRemove(user);

        return plainToInstance(ReadUserDto, userDeleted);
    }

    async removeAll(payload: UserEntity[]): Promise<UserEntity> {
        const usersDeleted = await this.repository.softRemove(payload);
        return usersDeleted[0];
    }

    async findUsersByRole(role: string): Promise<UserEntity[]> {
        const users = await this.repository.find({
            where: { role: { name: ILike(`%${role}%`) } }, // ILike is case insensitive
            relations: { role: true, status: true },
        });

        if (!users) {
            throw new NotFoundException('No existen usuarios con el rol: ' + role);
        }

        return users;
    }
}
