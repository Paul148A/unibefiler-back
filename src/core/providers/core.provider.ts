import { ConfigEnum } from "src/auth/enums/repository.enum";
import { SemesterEntity } from "../entities/semester.entity";
import { CoreRepositoryEnum } from "../enums/core-repository-enum";
import { DataSource } from "typeorm";
import { CareerEntity } from "../entities/career.entity";


export const coreProviders = [
    {
        provide: CoreRepositoryEnum.SEMESTER_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SemesterEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: CoreRepositoryEnum.CAREER_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(CareerEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
];
