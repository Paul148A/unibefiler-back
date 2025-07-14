import { Module, Global, forwardRef } from '@nestjs/common';
import { PersonalService } from './services/personal.service';
import { InscriptionService } from './services/inscription.service';
import { DegreeService } from './services/degree.service';
import { PersonalController } from './controller/personal.controller';
import { InscriptionController } from './controller/inscription.controller';
import { DegreeController } from './controller/degree.controller';
import { RecordService } from './services/record.service';
import { RecordController } from './controller/record.controller';
import { PermissionService } from './services/permission.service';
import { PermissionController } from './controller/permission.controller';
import { uploadFilesProviders } from './providers/upload-files.provider';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { GradeController } from './controller/grade.controller';
import { GradeService } from './services/grade.service';
import { CoreModule } from 'src/core/core.module';
import { CoreRepositoryEnum } from 'src/core/enums/core-repository-enum';

@Global()
@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    CoreModule
  ],
  controllers: [
    PersonalController,
    InscriptionController,
    DegreeController,
    RecordController,
    PermissionController,
    GradeController
  ],
  providers: [
    ...uploadFilesProviders,
    PersonalService,
    InscriptionService,
    DegreeService,
    RecordService,
    PermissionService,
    GradeService
  ],
  exports: [
    PersonalService,
    InscriptionService,
    DegreeService,
    RecordService,
    PermissionService,
    GradeService,
  ]
})
export class FilesModule { }