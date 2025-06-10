// import { getDegreeDocumentsByRecordId } from '../../../../unibe-filer-front/src/services/upload-files/degree-documents.service';
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
} from '@nestjs/common';
import { DegreeService } from '../services/degree.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/services/user.service';
import { DegreeResponseDto } from '../dto/degree-document/degree-response.dto';

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
    const updateDegreeDto = await this.degreeService.processUploadedFiles(
      files,
      id
    );
    await this.degreeService.updateDegree(id, updateDegreeDto);
    return { message: 'Documentos de grado actualizados correctamente' };
  }

  @Get('list-degrees')
  @UseGuards(AuthGuard('jwt-cookie'))
  async listDegrees(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const documents = await this.degreeService.getDegreeDocumentsByRecordId(user.record.id);
    return {
      message: 'Documentos de grado obtenidos correctamente',
      degrees: documents.map((d) => new DegreeResponseDto(d)),
    };
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

  @Get('record/:id')
  async findDegreeDocumentsByRecordId(@Param('id') id: string) {
    const documents = await this.degreeService.getDegreeDocumentsByRecordId(id);
    return {
      message: 'Documentos de grado obtenidos correctamente',
      data: documents,
    };
  }
}
