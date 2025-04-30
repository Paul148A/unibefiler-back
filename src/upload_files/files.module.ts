import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalDocumentsEntity } from './entities/personal-documents.entity';
import { InscriptionDocumentsEntity } from './entities/inscription-documents.entity';
import { DegreeDocumentsEntity } from './entities/degree-documents.entity';
import { PersonalDocumentsService } from './services/personal-documents.service';
import { InscriptionFormService } from './services/inscription-form.service';
import { DegreeService } from './services/degree.service';
import { UploadPersonalDocumentsController } from './controller/personal-documents.controller';
import { UploadInscriptionFormController } from './controller/inscription-form.controller';
import { UploadDegreeController } from './controller/degree.controller';
import { RecordEntity } from './entities/record.entity';
import { RecordService } from './services/record.service';
import { RecordController } from './controller/record.controller';
import { GradeEnrollmentEntity } from './entities/grade-enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonalDocumentsEntity, 
      InscriptionDocumentsEntity, 
      DegreeDocumentsEntity, 
      RecordEntity, 
      GradeEnrollmentEntity
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