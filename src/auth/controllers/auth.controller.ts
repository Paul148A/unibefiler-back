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
}
