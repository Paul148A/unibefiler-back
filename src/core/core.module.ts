import { forwardRef, Global, Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { coreProviders } from "./providers/core.provider";
import { SemesterController } from "./controllers/semester.controller";
import { SemesterService } from "./services/semester.service";
import { DatabaseModule } from "src/database/database.module";


@Global()
@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [
    SemesterController
  ],
  providers: [
    ...coreProviders,
    SemesterService
  ],
  exports: [
    SemesterService
  ]
})
export class CoreModule { }