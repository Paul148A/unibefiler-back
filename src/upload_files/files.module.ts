import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalDocuments } from './entities/personal-documents.entity';
import { InscriptionForm } from './entities/inscription-form.entity';
import { Degree } from './entities/degree.entity';
import { PersonalDocumentsService } from './services/personal-documents.service';
import { InscriptionFormService } from './services/inscription-form.service';
import { DegreeService } from './services/degree.service';
import { UploadPersonalDocumentsController } from './controller/personal-documents.controller';
import { UploadInscriptionFormController } from './controller/inscription-form.controller';
import { UploadDegreeController } from './controller/degree.controller';
import { Record } from './entities/record.entity';
import { RecordService } from './services/record.service';
import { RecordController } from './controller/record.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonalDocuments,
      InscriptionForm,
      Degree,
      Record
    ]),
  ],
  controllers: [
    UploadPersonalDocumentsController,
    UploadInscriptionFormController,
    UploadDegreeController,
    RecordController
    
  ],
  providers: [
    PersonalDocumentsService,
    InscriptionFormService,
    DegreeService,
    RecordService
  ],
  exports: [RecordService]
})
export class FilesModule {}