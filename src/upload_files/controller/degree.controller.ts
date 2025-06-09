import { getDegreeDocumentsByRecordId } from '../../../../unibe-filer-front/src/services/upload-files/degree-documents.service';
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
} from '@nestjs/common';
import { DegreeService } from '../services/degree.service';
import { Response } from 'express';

@Controller('api1/degree')
export class DegreeController {
  constructor(private readonly degreeService: DegreeService) {}

  @Post('upload-degree')
  @UseInterceptors(DegreeService.getFileUploadInterceptor())
  async uploadDegree(@UploadedFiles() files) {
    const createDegreeDto = await this.degreeService.processUploadedFiles(
      files,
    );
    await this.degreeService.saveDegree(createDegreeDto);
    return { message: 'Documentos de grado subidos correctamente' };
  }

  @Put('update-degree/:id')
  @UseInterceptors(DegreeService.getFileUploadInterceptor())
  async updateDegree(@Param('id') id: string, @UploadedFiles() files) {
    const updateDegreeDto = await this.degreeService.processUploadedFiles(
      files,
    );
    await this.degreeService.updateDegree(id, updateDegreeDto);
    return { message: 'Documentos de grado actualizados correctamente' };
  }

  @Get('list-degrees')
  async listDegrees() {
    const degrees = await this.degreeService.getAllDegrees();
    return { message: 'Documentos de grado obtenidos correctamente', degrees };
  }

  @Get('degree/:id')
  async getDegree(@Param('id') id: string) {
    const degree = await this.degreeService.getDegreeById(id);
    return { message: 'Documento de grado obtenido correctamente', degree };
  }

  @Delete('delete-degree/:id')
  async deleteDegree(@Param('id') id: string) {
    await this.degreeService.deleteDegree(id);
    return { message: 'Documento de grado eliminado correctamente' };
  }

  @Get('download/:id/:documentType')
  async downloadDocument(
    @Param('id') id: string,
    @Param('documentType') documentType: string,
    @Res() res: Response,
  ) {
    await this.degreeService.downloadDocument(id, documentType, res);
  }

  @Get('degree-docs/:id')
  async getDegreeDocumentsByRecordId(@Param('id') id: string) {
    const documents = await getDegreeDocumentsByRecordId(id);
    return {
      message: 'Documentos de grado obtenidos correctamente',
      documents,
    };
  }
}
