import {DataSource} from 'typeorm';
import { ConfigEnum } from 'src/auth/enums/repository.enum';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { RecordEntity } from '../entities/record.entity';
import { PersonalDocumentsEntity } from '../entities/personal-documents.entity';
import { InscriptionDocumentsEntity } from '../entities/inscription-documents.entity';
import { DegreeDocumentsEntity } from '../entities/degree-documents.entity';

export const authProviders = [
    {
        provide: UploadFilesRepositoryEnum.RECORD_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(RecordEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: UploadFilesRepositoryEnum.PERSONAL_DOCUMENTS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PersonalDocumentsEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: UploadFilesRepositoryEnum.INSCRIPTION_DOCUMENTS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(InscriptionDocumentsEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: UploadFilesRepositoryEnum.DEGREE_DOCUMENTS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(DegreeDocumentsEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
];
