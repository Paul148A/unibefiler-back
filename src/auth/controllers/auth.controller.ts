import { Controller, Post, HttpCode, HttpStatus, Body, Get, Res, UnauthorizedException, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { LoginDto } from "../dto/login/login.dto";
import { AuthService } from "../services/auth.service";
import { Response } from 'express';
import { AuthGuard } from "@nestjs/passport";
import { CreateUserDto } from "../dto/user/create-user.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post('register')
    async register(@Body() payload: CreateUserDto) {
    return this.authService.register(payload);
  }

    @ApiOperation({ summary: 'Login' })
    @Post('login')
    async login(@Body() payload: LoginDto, @Res() res: Response) {
        try {
            const serviceResponse = await this.authService.login(payload);

            res.cookie('authToken', serviceResponse.data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000,
            });

            return res.status(HttpStatus.OK).json({
                data: {
                    user: serviceResponse.data.user,
                },
                message: 'Correct Access',
                title: 'Welcome',
            });
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Usuario y/o contraseña no válidos',
                    error: 'Unauthorized',
                });
            }

            // Maneja otros errores
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Ocurrió un error en el servidor',
                error: 'Internal Server Error',
            });
        }
    }

    @Post('logout')
    async logout(@Res() res: Response) {
        await this.authService.logout(res);
        return res.status(HttpStatus.OK).json({
            message: 'Logged out successfully',
            success: true
        });
    }

    @UseGuards(AuthGuard('jwt-cookie'))
    @Get('check-auth')
    async checkAuth(@Request() req) {
        const user = req.user;

        return {
            isAuthenticated: true,
            user: {
                id: user.sub,
                role: user.role,
            },
        };
    }

    // @ApiOperation({summary: 'Change Password'})
    // @Auth()
    // @Put(':id/change-password')
    // @HttpCode(HttpStatus.CREATED)
    // async changePassword(@Param('id', ParseUUIDPipe) id: string, @Body() payload: PasswordChangeDto): Promise<ResponseHttpModel> {
    //     const serviceResponse = await this.authService.changePassword(id, payload);

    //     return {
    //         data: serviceResponse,
    //         message: 'La contraseña fue cambiada',
    //         title: 'Contraseña Actualizada',
    //     };
    // }

    // @ApiOperation({summary: 'Find User Information'})
    // @Auth()
    // @Get('user-information')
    // @HttpCode(HttpStatus.OK)
    // async findUserInformation(@User() user: UserEntity): Promise<ResponseHttpModel> {
    //     const serviceResponse = await this.authService.findUserInformation(user.id);

    //     return {
    //         data: serviceResponse,
    //         message: 'La información del usuario fue actualizada',
    //         title: 'Atualizado',
    //     };
    // }

    // @ApiOperation({summary: 'Refresh Token'})
    // @Auth()
    // @Get('refresh-token')
    // @HttpCode(HttpStatus.CREATED)
    // refreshToken(@User() user: UserEntity) {
    //     const serviceResponse = this.authService.refreshToken(user);

    //     return {
    //         data: serviceResponse.data,
    //         message: 'Correct Access',
    //         title: 'Refresh Token',
    //     };
    // }


    // @Patch('reset-passwords')
    // @HttpCode(HttpStatus.OK)
    // async resetPassword(@Body() payload: any): Promise<ResponseHttpModel> {
    //     await this.authService.resetPassword(payload);

    //     return {
    //         data: null,
    //         message: `Por favor inicie sesión`,
    //         title: 'Contraseña Reseteada',
    //     };
    // }
}
