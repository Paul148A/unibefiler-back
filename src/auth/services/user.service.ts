import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
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
import { SemesterService } from 'src/core/services/semester.service';
import { CareerService } from 'src/core/services/career.service';


@Injectable()
export class UsersService {
    constructor(
        @Inject(AuthRepositoryEnum.USER_REPOSITORY)
        private repository: Repository<UserEntity>,
        @Inject(forwardRef(() => RecordService))
        private readonly recordService: RecordService,
        private readonly rolesService: RolesService,
        private readonly statusService: StatusService,
        private readonly semesterService: SemesterService,
        private readonly careerService: CareerService,
    ) {
    }

    async createUserWithRecord(payload: CreateUserDto): Promise<{ user: UserEntity, record?: RecordEntity }> {
        const user = await this.create(payload);

        if (!user) {
            throw new NotFoundException('No se pudo crear el usuario');
        }

        // Solo crear record y documentos si el rol es "student" o "Estudiante"
        const roleName = user.role.name.toLowerCase();
        const roleDescription = user.role.description.toLowerCase();
        
        if (roleName === 'student' || roleName === 'estudiante' || 
            roleDescription === 'student' || roleDescription === 'estudiante') {
            const record = await this.recordService.createRecord(user.id);
            return {
                user,
                record
            };
        }

        return {
            user
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

        let validateSemester = null;
        if (payload.semester) {
            validateSemester = await this.semesterService.findOne(payload.semester);
            if (!validateSemester) {
                throw new NotFoundException('El semestre no existe');
            }
        }

        let validateCareer = null;
        if (payload.career) {
            validateCareer = await this.careerService.findById(payload.career);
            if (!validateCareer) {
                throw new NotFoundException('La carrera no existe');
            }
        }

        const newUser = this.repository.create({
            ...payload,
            role: validateRole,
            status: validateStatus,
            semester: validateSemester,
            career: validateCareer,
        });
        return await this.repository.save(newUser);
    }

    async findAll(): Promise<ServiceResponseHttpModel> {
        const relations = { role: true, status: true, semester: true, career: true };

        const response = await this.repository.findAndCount({
            relations,
        });

        return {
            data: response[0],
        };
    }

    async findOne(id: string): Promise<UserEntity> {
        const user = await this.repository.findOne({
            where: { id },
            relations: { role: true, status: true, record: true, semester: true, career: true },
            select: { password: false },
        });

        if (!user) {
            throw new NotFoundException('El usuario con el id: ' + id + ' no existe');
        }

        return user;
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
        if (!role) {
            throw new NotFoundException('El rol no existe: ' + role);
        }

        const users = await this.repository.find({
            where: { role: { name: ILike(`%${role}%`) } },
            relations: { role: true, status: true, semester: true, career: true },
        });

        if (!users) {
            throw new NotFoundException('No existen usuarios con el rol: ' + role);
        }

        return users;
    }
    
    async updateStatus(id: string, statusId: string): Promise<UserEntity> {
        const user = await this.repository.findOne({
            where: { id },
            relations: { role: true, status: true, semester: true, career: true },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const status = await this.statusService.findOne(statusId);
        if (!status) {
            throw new NotFoundException('Estado no encontrado');
        }

        user.status = status;
        return await this.repository.save(user);
    }
}
