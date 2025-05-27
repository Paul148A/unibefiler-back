import { Controller, Post, HttpCode, HttpStatus, Body, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ResponseHttpModel } from "../models/response-http.model";
import { StatusService } from "../services/status.service";
import { StatusDto } from "../dto/status/status.dto";

@ApiTags('Status')
@Controller('api1/status')
export class StatusController {
  constructor(private statusService: StatusService) {}

  @ApiOperation({ summary: 'Create Status' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() payload: StatusDto): Promise<ResponseHttpModel> {
    const serviceResponse = await this.statusService.create(payload);

    return {
      data: serviceResponse,
      message: 'Estado creado correctamente',
      title: 'Created',
    };
  }

  @ApiOperation({ summary: 'Find All Status' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ResponseHttpModel> {
    const serviceResponse = await this.statusService.findAll();
    return {
      data: serviceResponse,
      message: 'Todos los estados',
      title: 'Estados encontrados',
    };
  }

  @ApiOperation({ summary: 'Find One Status' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpModel> {
    const serviceResponse = await this.statusService.findOne(id);

    return {
      data: serviceResponse,
      message: `Estado encontrado`,
      title: `Success`,
    };
  }

//   @ApiOperation({ summary: 'Update Role' })
//   @Put(':id')
//   @HttpCode(HttpStatus.CREATED)
//   async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateRoleDto): Promise<ResponseHttpModel> {
//     const serviceResponse = await this.statusService.update(id, payload);

//     return {
//       data: serviceResponse,
//       message: `Rol actualizado`,
//       title: `Updated`,
//     };
//   }
  
//   @ApiOperation({ summary: 'Delete Role' })
//   @Delete(':id')
//   @HttpCode(HttpStatus.CREATED)
//   async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseHttpModel> {
//     const serviceResponse = await this.statusService.remove(id);

//     return {
//       data: serviceResponse,
//       message: `Rol eliminado`,
//       title: `Deleted`,
//     };
//   }

//   @ApiOperation({ summary: 'Delete Multiple Roles' })
//   @Patch('remove-all')
//   @HttpCode(HttpStatus.CREATED)
//   async removeAll(@Body() payload: RoleEntity[]): Promise<ResponseHttpModel> {
//     const serviceResponse = await this.statusService.removeAll(payload);

//     return {
//       data: serviceResponse,
//       message: `Roles eliminados`,
//       title: `Deleted`,
//     };
//   }
}