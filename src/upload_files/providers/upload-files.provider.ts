import {DataSource} from 'typeorm';
import { ConfigEnum, UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { RecordEntity } from '../entities/record.entity';
import { PersonalDocumentsEntity } from '../entities/personal-documents.entity';
import { InscriptionDocumentsEntity } from '../entities/inscription-documents.entity';
import { DegreeDocumentsEntity } from '../entities/degree-documents.entity';
import { GradeEnrollmentEntity } from '../entities/grade-enrollment.entity';
import { EnrollmentDocEntity } from '../entities/enrollment-documents.entity';
import { PermissionDocumentsEntity } from '../entities/permission-documents.entity';

export const uploadFilesProviders = [
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
    {
        provide: UploadFilesRepositoryEnum.GRADE_ENROLLMENT_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(GradeEnrollmentEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: UploadFilesRepositoryEnum.ENROLLMENT_DOC_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(EnrollmentDocEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    },
    {
        provide: UploadFilesRepositoryEnum.PERMISSION_DOCUMENTS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PermissionDocumentsEntity),
        inject: [ConfigEnum.PG_DATA_SOURCE],
    }
];
