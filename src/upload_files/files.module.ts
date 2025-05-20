import { Module, Global } from '@nestjs/common';
import { PersonalDocumentsService } from './services/personal-documents.service';
import { InscriptionFormService } from './services/inscription-form.service';
import { DegreeService } from './services/degree.service';
import { UploadPersonalDocumentsController } from './controller/personal-documents.controller';
import { UploadInscriptionFormController } from './controller/inscription-form.controller';
import { UploadDegreeController } from './controller/degree.controller';
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
    UploadPersonalDocumentsController,
    UploadInscriptionFormController,
    UploadDegreeController,
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