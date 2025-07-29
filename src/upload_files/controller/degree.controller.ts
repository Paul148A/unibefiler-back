import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Get,
  Put,
  Param,
  Delete,
  Res,
  Body,
  BadRequestException,
  UseGuards,
  Request,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { DegreeService } from '../services/degree.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/services/user.service';
import { DegreeResponseDto } from '../dto/degree-document/degree-response.dto';
import { DegreeDocumentsEntity } from '../entities/degree-documents.entity';
import { UpdateDegreeStatusDto } from '../dto/degree-document/update-degree.dto';

@Controller('api1/degree')
export class DegreeController {
  constructor(
    private readonly degreeService: DegreeService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload-degree')
  @UseGuards(AuthGuard('jwt-cookie'))
  @UseInterceptors(DegreeService.getFileUploadInterceptor())
  async uploadDegree(@UploadedFiles() files, @Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const createDegreeDto = await this.degreeService.processUploadedFiles(files, user.record.id);
    await this.degreeService.saveDegree(createDegreeDto);
    return { message: 'Documentos de grado subidos correctamente' };
  }

  @Put('update-degree/:id')
  @UseInterceptors(DegreeService.getFileUploadInterceptor())
  async updateDegree(@Param('id') id: string, @UploadedFiles() files) {
    const UpdateDegreeDto =
      await this.degreeService.processUploadedFilesForUpdate(files);
    const updatedDegree =
      await this.degreeService.updateDegreeForm(
        id,
        UpdateDegreeDto,
      );
    return {
      message: 'Formulario de inscripción actualizado correctamente',
      data: new DegreeResponseDto(updatedDegree),
    };
  }

  @Patch('update-degree-status/:id')
  async updateDegreeStatus(@Param('id') id: string, @Body() dto: UpdateDegreeStatusDto) {
    const updated = await this.degreeService.updateDegreeStatus(id, dto);
    return {
      message: 'Estado actualizado correctamente',
      data: new DegreeResponseDto(updated),
    };
  }

  @Get('list-degrees')
  @UseGuards(AuthGuard('jwt-cookie'))
  async listDegrees(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const document = await this.degreeService.getDegreeDocumentsByRecordId(user.record.id);
    return {
      message: 'Documento de grado obtenido correctamente',
      data: document ? new DegreeResponseDto(document) : null,
    };
  }

  @Get('degree/:id')
  async getDegree(@Param('id') id: string) {
    const degree = await this.degreeService.getDegreeById(id);
    return { message: 'Documento de grado obtenido correctamente', data: new DegreeResponseDto(degree) };
  }

  @Delete('delete-degree/:id')
  async deleteDegree(@Param('id') id: string) {
    await this.degreeService.deleteDegree(id);
    return { message: 'Documento de grado eliminado correctamente' };
  }

  @Delete('delete-file/:id/:field')
  async deleteFile(@Param('id') id: string, @Param('field') field: string) {
    await this.degreeService.deleteFile(id, field);
    return { message: 'Archivo eliminado correctamente' };
  }

  @Get('download/:id/:documentType')
  async downloadDocument(
    @Param('id') id: string,
    @Param('documentType') documentType: string,
    @Res() res: Response,
  ) {
    await this.degreeService.downloadDocument(id, documentType, res);
  }

  @Get('record/:id')
  async findDegreeDocumentsByRecordId(@Param('id') id: string) {
    const document = await this.degreeService.getDegreeDocumentsByRecordId(id);
    return {
      message: 'Documento de grado obtenido correctamente',
      data: document ? new DegreeResponseDto(document) : null,
    };
  }
}
