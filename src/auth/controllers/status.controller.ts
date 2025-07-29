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

}