import { Injectable, Inject, NotFoundException, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Repository } from "typeorm";
import { UserEntity } from "../entities";
import { AuthRepositoryEnum } from "../enums/repository.enum";
import { ServiceResponseHttpModel } from "../models/service-response-http.model";
import { LoginDto } from "../dto/login/login.dto";
import { JwtService } from "./jwt.service";
import { Response } from 'express';
import { RecordService } from "src/upload_files/services/record.service";

@Injectable()
export class AuthService {
    private readonly MAX_ATTEMPTS = 3;

    constructor(
        @Inject(AuthRepositoryEnum.USER_REPOSITORY)
        private repository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly recordService: RecordService
    ) {}

    async register(payload: any): Promise<ServiceResponseHttpModel> {
        try {
            const existingUser = await this.repository.findOne({
                where: { identification: payload.identification }
            });
            if (existingUser) {
                throw new BadRequestException('El usuario ya existe');
            }
            const user = new UserEntity();
            Object.assign(user, payload);
            const createdUser = await this.repository.save(user);
            const userWithRole = await this.repository.findOne({
                where: { id: createdUser.id },
                relations: { role: true }
            });

            let record = null;
            if (userWithRole) {
                const roleName = userWithRole.role.name.toLowerCase();
                const roleDescription = userWithRole.role.description.toLowerCase();
                
                if (roleName === 'student' || roleName === 'estudiante' || 
                    roleDescription === 'student' || roleDescription === 'estudiante') {
                    record = await this.recordService.createRecord(createdUser.id);
                }
            }

            const { password, ...userData } = userWithRole || createdUser;
            return {
                data: {
                    user: userData,
                    record: record ? {
                        id: record.id,
                        code: record.code
                    } : null,
                    message: record ? 'Usuario registrado con expediente creado automáticamente' : 'Usuario registrado exitosamente',
                },
            };
        } catch (error) {
            throw new BadRequestException(error.message || 'Error al registrar usuario');
        }
    }

    async login(payload: LoginDto): Promise<{ data: { user: any; token: string } }> {
        const user: UserEntity = await this.repository.findOne({
            where: { identification: payload.identification },
            relations: { role: true, record: true },
        });

        if (!user || !(await this.checkPassword(payload.password, user))) {
            throw new UnauthorizedException('Usuario y/o contraseña no válidos');
        }

        const token = await this.jwtService.generateToken({
            sub: user.id,
            role: user.role.name,
        });

        const { password, ...userRest } = user;

        return {
            data: {
                user: userRest,
                token,
            },
        };
    }

    async logout(response: Response): Promise<ServiceResponseHttpModel> {
        response.cookie('authToken', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            expires: new Date(0),
            maxAge: 0
        });
    
        response.clearCookie('authToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/'
        });
    
        return {
            data: {
                message: 'Sesión cerrada exitosamente',
                success: true
            }
        };
    }

    async resetPassword(payload: any): Promise<ServiceResponseHttpModel> {
        const user = await this.repository.findOne({
            where: { identification: payload.identification },
        });

        if (!user) {
            throw new NotFoundException({
                message: 'Intente de nuevo',
                error: 'Usuario no encontrado para resetear contraseña',
            });
        }

        user.password = payload.newPassword;
        await this.repository.save(user);
        return { data: true };
    }

    private async checkPassword(password_verification: string, user: UserEntity): Promise<null | UserEntity> {
        const { password, ...userRest } = user;
        const matchPassword = await this.comparePassword(password, password_verification);

        if (matchPassword) {
            await this.repository.save(userRest);
            return user;
        }
        return null;
    }

    private async comparePassword(password: string, password_verification: string): Promise<boolean> {
        return password === password_verification;
    }
}