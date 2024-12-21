import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {FindOptionsWhere, ILike, LessThan, Repository} from 'typeorm';
import { AuthRepositoryEnum } from '../enums/repository.enum';
import { UserEntity } from '../entities';


@Injectable()
export class UsersService {
    constructor(
        @Inject(AuthRepositoryEnum.USER_REPOSITORY)
        private repository: Repository<UserEntity>,
    ) {
    }

    async create(payload: CreateUserDto): Promise<UserEntity> {
        const newUser = this.repository.create(payload);
        return await this.repository.save(newUser);
    }

    async findAll(params?: FilterUserDto): Promise<ServiceResponseHttpModel> {
        const relations = {roles: true, careers: true};

        //All
        const response = await this.repository.findAndCount({
            relations,
        });

        return {
            data: response[0],
            pagination: {totalItems: response[1], limit: 10},
        };
    }

    async findOne(id: string): Promise<UserEntity> {
        const user = await this.repository.findOne({
            where: {id},
            relations: {roles: true},
            select: {password: false},
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado (find one)');
        }

        return user;
    }

    async findByUsername(username: string): Promise<UserEntity> {
        const user = await this.repository.findOne({
            where: {username},
            select: {password: false},
        });

        if (!user) {
            throw new NotFoundException('Nombre de usuario no existe');
        }

        return user;
    }

    async update(id: string, payload: UpdateUserDto): Promise<UserEntity> {
        const user = await this.repository.preload({id, ...payload});

        if (!user) {
            throw new NotFoundException('Usuario no encontrado para actualizar');
        }

        this.repository.merge(user, payload);

        return await this.repository.save(user);
    }

    async reactivate(id: string): Promise<ReadUserDto> {
        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundException('Usuario no encontrado para reactivar');
        }

        user.suspendedAt = null;
        user.maxAttempts = MAX_ATTEMPTS;

        const userUpdated = await this.repository.save(user);

        return plainToInstance(ReadUserDto, userUpdated);
    }

    async remove(id: string): Promise<ReadUserDto> {
        const user = await this.repository.findOneBy({id});

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
}
