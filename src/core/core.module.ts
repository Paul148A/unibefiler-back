import { forwardRef, Global, Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { coreProviders } from "./providers/core.provider";
import { SemesterController } from "./controllers/semester.controller";
import { SemesterService } from "./services/semester.service";
import { CareerController } from "./controllers/career.controller";
import { CareerService } from "./services/career.service";
import { DatabaseModule } from "src/database/database.module";
import { DocumentStatusController } from './controllers/document-status.controller';

@Global()
@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [
    SemesterController,
    CareerController,
    DocumentStatusController
  ],
  providers: [
    ...coreProviders,
    SemesterService,
    CareerService
  ],
  exports: [
    SemesterService,
    CareerService,
    ...coreProviders // Exportar todos los providers, incluyendo DOCUMENT_STATUS_REPOSITORY
  ]
})
export class CoreModule { }