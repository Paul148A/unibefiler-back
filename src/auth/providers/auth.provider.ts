import {DataSource} from 'typeorm';
import { AuthRepositoryEnum, ConfigEnum } from '../enums/repository.enum';
import { UserEntity } from '../entities';

export const authProviders = [
    {
        provide: AuthRepositoryEnum.USER_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(UserEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
];
