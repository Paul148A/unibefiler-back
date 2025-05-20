import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {FindOptionsWhere, ILike, LessThan, Repository} from 'typeorm';
import { AuthRepositoryEnum } from '../enums/repository.enum';
import { UserEntity } from '../entities';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { FilterUserDto } from '../dto/user/filter-user.dto';
import { ReadUserDto } from '../dto/user/read-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { ServiceResponseHttpModel } from '../models/service-response-http.model';
import { plainToInstance } from 'class-transformer';
import { RecordService } from 'src/upload_files/services/record.service';
import { RecordEntity } from 'src/upload_files/entities/record.entity';


@Injectable()
export class UsersService {
    constructor(
        @Inject(AuthRepositoryEnum.USER_REPOSITORY)
        private repository: Repository<UserEntity>,
        private readonly recordService: RecordService
    ) {
    }

 async createUser(userData: any): Promise<UserEntity> {
    // Iniciamos transacción
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear el usuario
      const user = new UserEntity();
      Object.assign(user, userData);
      const createdUser = await queryRunner.manager.save(UserEntity, user);

      // 2. Crear record automáticamente
      const record = await this.recordService.createRecordWithTransaction(
        createdUser.id, 
        queryRunner
      );

      // Confirmar transacción
      await queryRunner.commitTransaction();

      // Asignar el record al usuario para la respuesta
      createdUser.record = record;
      
      return createdUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createWithRecord(payload: CreateUserDto): Promise<{user: UserEntity, record: RecordEntity}> {
  // 1. Crear usuario
  const user = await this.create(payload);
  
  // 2. Crear record automático
  const record = await this.recordService.createRecord(user.id);
  
  return {
    user,
    record
  };
}

    async create(payload: CreateUserDto): Promise<UserEntity> {
        // console.log("RECIBIDO DE PAYLOAD",payload)
        const newUser = this.repository.create(payload);
        // console.log("RECIBIDO DE USER",newUser)
        return await this.repository.save(newUser);
    }

    async findAll(params?: FilterUserDto): Promise<ServiceResponseHttpModel> {
        const relations = {role: true, status: true};

        //All
        const response = await this.repository.findAndCount({
            relations,
        });

        return {
            data: response[0],
        };
    }

    async findOne(id: string): Promise<FilterUserDto> {
        const user = await this.repository.findOne({
            where: {id},
            relations: {role: true, status: true},
            select: {password: false},
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
            where: {identification},
            select: {password: false},
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
        const user = await this.repository.preload({id, ...payload});

        if (!user) {
            throw new NotFoundException('Usuario no encontrado para actualizar');
        }

        this.repository.merge(user, payload);

        return await this.repository.save(user);
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
