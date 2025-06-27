import { Controller, Post, Body, Get, Param, Put, Delete, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { RecordService } from '../services/record.service';
import { CreateRecordDto } from '../dto/record/create-record.dto';
import { UpdateRecordDto } from '../dto/record/update-record.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/custom-role-guard/roles.guard';
import { Roles } from 'src/auth/custom-role-guard/roles.decorator';

@Controller('api1/records')
@UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
export class RecordController {
  constructor(private readonly recordService: RecordService) { }

  @Post()
  async create(@Body() payload: CreateRecordDto) {
    return this.recordService.createRecord(payload.userId);
  }

  @Get()
  @Roles('teacher', 'admin', 'language')
  async findAll() {
    return this.recordService.getAllRecords();
  }

  @Get('filter/search')
  @Roles('teacher', 'admin', 'language')
  async filterRecords(@Query('dni') dni?: string, @Query('name') name?: string) {
    if (dni) {
      return this.recordService.getRecordsByUserDni(dni);
    }
    if (name) {
      return this.recordService.getRecordsByUserName(name);
    }
    return this.recordService.getAllRecords();
  }

  @Get('user/:userId')
  async findRecordByUserId(@Param('userId') userId: string) {
    const records = await this.recordService.getRecordsByUserId(userId);
    return {
      data: records,
      message: 'Records encontrados',
      title: 'Success',
    };
  }

  @Get('role/:roleName')
  async findRecordsByUserRole(@Param('roleName') name: string) {
    return this.recordService.getRecordsByUserRole(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const record = await this.recordService.getRecordById(id);
    if (!record) {
      throw new NotFoundException(`Record con ID ${id} no encontrado`);
    }
    return record;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateRecordDto) {
    const record = await this.recordService.updateRecord(
      id
    );
    if (!record) {
      throw new NotFoundException(`Record con ID ${id} no encontrado`);
    }
    return record;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const record = await this.recordService.getRecordById(id);
    if (!record) {
      throw new NotFoundException(`Record con ID ${id} no encontrado`);
    }
    await this.recordService.deleteRecord(id);
    return { message: `Record con ID ${id} eliminado correctamente` };
  }
}
