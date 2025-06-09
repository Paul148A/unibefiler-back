import { Module, Global } from '@nestjs/common';
import { PersonalDocumentsService } from './services/personal.service';
import { InscriptionFormService } from './services/inscription.service';
import { DegreeService } from './services/degree.service';
import { PersonalController } from './controller/personal.controller';
import { InscriptionController } from './controller/inscription.controller';
import { DegreeController } from './controller/degree.controller';
import { RecordService } from './services/record.service';
import { RecordController } from './controller/record.controller';
import { uploadFilesProviders } from './providers/upload-files.provider';
import { DatabaseModule } from 'src/database/database.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [
    PersonalController,
    InscriptionController,
    DegreeController,
    RecordController

  ],
  providers: [
    ...uploadFilesProviders,
    PersonalDocumentsService,
    InscriptionFormService,
    DegreeService,
    RecordService
  ],
  exports: [
    PersonalDocumentsService,
    InscriptionFormService,
    DegreeService,
    RecordService
  ]
})
export class FilesModule { }