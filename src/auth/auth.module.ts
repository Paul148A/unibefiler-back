/* eslint-disable prettier/prettier */
import { Global, Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";

@Global()
@Module({
    imports: [
        DatabaseModule,
    ],
    controllers: [],
    providers: [],
    exports: [],
})

export class AuthModule {
}
