import {Controller,Post,Body,Get,Param,Put,Delete,NotFoundException,} from '@nestjs/common';
import { RecordService } from '../services/record.service';
import { CreateRecordDto } from '../dto/record/create-record.dto';
import { UpdateRecordDto } from '../dto/record/update-record.dto';

@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  async create(@Body() payload: CreateRecordDto) {
    return this.recordService.createRecord(
      payload.personalDocumentsId,
      payload.inscriptionFormId,
      payload.degreeId,
    );
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
      id,
      payload.personalDocumentsId,
      payload.inscriptionFormId,
      payload.degreeId,
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
