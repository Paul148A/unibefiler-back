import { Module, Global } from '@nestjs/common';
import { PersonalService } from './services/personal.service';
import { InscriptionService } from './services/inscription.service';
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
    PersonalService,
    InscriptionService,
    DegreeService,
    RecordService
  ],
  exports: [
    PersonalService,
    InscriptionService,
    DegreeService,
    RecordService
  ]
})
export class FilesModule { }