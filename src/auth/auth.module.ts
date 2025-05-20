/* eslint-disable prettier/prettier */
import { Global, Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { AuthController } from "./controllers/auth.controller";
import { UsersController } from "./controllers/user.controller";
import { authProviders } from "./providers/auth.provider";
import { AuthService } from "./services/auth.service";
import { UsersService } from "./services/user.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { JwtService } from "./services/jwt.service";
import { JwtCookieStrategy } from "./strategy/cookie.strategy";
import { FilesModule } from "src/upload_files/files.module";
import { RolesService } from "./services/rol.service";
import { StatusService } from "./services/status.service";
import { RolesController } from "./controllers/rol.controller";
import { StatusController } from "./controllers/status.controller";


@Global()
@Module({
    imports: [
        DatabaseModule,
        FilesModule,
        PassportModule.register({ defaultStrategy: 'jwt-cookie' }),
        JwtModule.register({
            secret: 'UnibeFilerSecretKey@*',
            signOptions: { expiresIn: '1h' }, 
        }),
    ],
    controllers: [AuthController, UsersController, RolesController, StatusController],
    providers: [...authProviders, AuthService, UsersService, JwtStrategy, JwtService, JwtCookieStrategy, RolesService, StatusService],
    exports: [AuthService, UsersService, JwtStrategy, JwtService, RolesService, StatusService],
})

export class AuthModule {
}
