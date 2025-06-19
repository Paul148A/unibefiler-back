import { forwardRef, Global, Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { coreProviders } from "./providers/core.provider";


@Global()
@Module({
  imports: [
    forwardRef(() => AuthModule)
  ],
  controllers: [
  ],
  providers: [
    ...coreProviders,
  ],
  exports: [
  ]
})
export class CoreModule { }