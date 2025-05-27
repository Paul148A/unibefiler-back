import { Controller, Post, HttpCode, HttpStatus, Body, Get, Query, Param, ParseUUIDPipe, Put, Delete, Patch, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CreateUserDto } from "../dto/user/create-user.dto";
import { FilterUserDto } from "../dto/user/filter-user.dto";
import { UpdateUserDto } from "../dto/user/update-user.dto";
import { UserEntity } from "../entities";
import { UsersService } from "../services/user.service";
import { ResponseHttpModel } from "../models/response-http.model";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../custom-role-guard/roles.decorator";
import { RolesGuard } from "../custom-role-guard/roles.guard";

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @ApiOperation({ summary: 'Usuario creado con un record automaticamente' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: CreateUserDto): Promise<ResponseHttpModel> {
    const serviceResponse = await this.usersService.createUserWithRecord(payload);
    return {
      data: {
        user: serviceResponse.user,
        record: serviceResponse.record
      },
      message: 'Usuario creado con un record automaticamente',
      title: 'Created',
    };
  }

  @ApiOperation({ summary: 'Find All' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ResponseHttpModel> {
    const serviceResponse = await this.usersService.findAll();

    return {
      data: serviceResponse.data,
      message: `index`,
      title: 'Usuarios encontrados',
    };
  }

  @ApiOperation({ summary: 'Find One' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpModel> {
    const serviceResponse = await this.usersService.findOne(id);

    return {
      data: serviceResponse as FilterUserDto,
      message: `show ${id}`,
      title: `Usuario encontrado`,
    };
  }

  @ApiOperation({ summary: 'Update One' })
  @Put(':id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateUserDto): Promise<ResponseHttpModel> {
    const serviceResponse = await this.usersService.update(id, payload);

    return {
      data: serviceResponse,
      message: `Usuario actualizado`,
      title: `Actualizado`,
    };
  }

  @ApiOperation({ summary: 'Remove One' })
  @Delete(':id')
  @HttpCode(HttpStatus.CREATED)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpModel> {
    const serviceResponse = await this.usersService.remove(id);

    return {
      data: serviceResponse,
      message: `Usuario eliminado`,
      title: `Eliminado`,
    };
  }

  @ApiOperation({ summary: 'Remove All' })
  @Patch('remove-all')
  @HttpCode(HttpStatus.CREATED)
  async removeAll(@Body() payload: UserEntity[]): Promise<ResponseHttpModel> {
    const serviceResponse = await this.usersService.removeAll(payload);

    return {
      data: serviceResponse,
      message: `Users deleted`,
      title: `Deleted`,
    };
  }

  @ApiOperation({ summary: 'Find By Identification' })
  @Get(':identification')
  @HttpCode(HttpStatus.OK)
  async findByIdentification(@Param('identification') identification: string): Promise<ResponseHttpModel> {
    const serviceResponse = await this.usersService.findByIdentification(identification);

    return {
      data: serviceResponse as FilterUserDto,
      message: `show ${identification}`,
      title: `Usuario encontrado`,
    };
  }
}
