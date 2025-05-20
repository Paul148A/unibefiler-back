import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param, ParseUUIDPipe, Put, Delete, Patch, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ResponseHttpModel } from "../models/response-http.model";
import { RoleDto } from "../dto/role/role.dto";
import { FilterRoleDto } from "../dto/role/filter-rol.dto";
import { UpdateRoleDto } from "../dto/role/update-rol.dto";
import { RolesService } from "../services/rol.service";
import { RoleEntity } from "../entities/rol.entity";

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create Role' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: RoleDto): Promise<ResponseHttpModel> {
    const serviceResponse = await this.rolesService.create(payload);

    return {
      data: serviceResponse,
      message: 'Rol creado correctamente',
      title: 'Created',
    };
  }

  @ApiOperation({ summary: 'Find All Roles' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() params: FilterRoleDto): Promise<ResponseHttpModel> {
    const serviceResponse = await this.rolesService.findAll(params);

    return {
      data: serviceResponse.data,
      message: 'Todos los roles',
      title: 'Roles encontrados',
    };
  }

  @ApiOperation({ summary: 'Find One Role' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpModel> {
    const serviceResponse = await this.rolesService.findOne(id);

    return {
      data: serviceResponse,
      message: `Rol encontrado`,
      title: `Success`,
    };
  }

  @ApiOperation({ summary: 'Update Role' })
  @Put(':id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateRoleDto): Promise<ResponseHttpModel> {
    const serviceResponse = await this.rolesService.update(id, payload);

    return {
      data: serviceResponse,
      message: `Rol actualizado`,
      title: `Updated`,
    };
  }
  
  @ApiOperation({ summary: 'Delete Role' })
  @Delete(':id')
  @HttpCode(HttpStatus.CREATED)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpModel> {
    const serviceResponse = await this.rolesService.remove(id);

    return {
      data: serviceResponse,
      message: `Rol eliminado`,
      title: `Deleted`,
    };
  }

  @ApiOperation({ summary: 'Delete Multiple Roles' })
  @Patch('remove-all')
  @HttpCode(HttpStatus.CREATED)
  async removeAll(@Body() payload: RoleEntity[]): Promise<ResponseHttpModel> {
    const serviceResponse = await this.rolesService.removeAll(payload);

    return {
      data: serviceResponse,
      message: `Roles eliminados`,
      title: `Deleted`,
    };
  }
}