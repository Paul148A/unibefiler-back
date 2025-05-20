import {DataSource} from 'typeorm';
import { AuthRepositoryEnum, ConfigEnum } from '../enums/repository.enum';
import { RoleEntity, UserEntity } from '../entities';
import { StatusEntity } from '../entities/status.entity';

export const authProviders = [
    {
        provide: AuthRepositoryEnum.USER_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: AuthRepositoryEnum.ROLE_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(RoleEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: AuthRepositoryEnum.STATUS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(StatusEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
];
