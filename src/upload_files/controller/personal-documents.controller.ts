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
import { PersonalDocumentsService } from '../services/personal-documents.service';
import { Response } from 'express';
import { PersonalDocumentsResponseDto } from '../dto/personal-document/personal-document-response.dto';

@Controller('files')
export class UploadPersonalDocumentsController {
  constructor(
    private readonly personalDocumentsService: PersonalDocumentsService,
  ) {}

  @Post('upload-personal-documents')
  @UseInterceptors(PersonalDocumentsService.getFileUploadInterceptor())
  async uploadPersonalDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    const createDto =
      await this.personalDocumentsService.processUploadedFilesForCreate(files);
    const documents = await this.personalDocumentsService.savePersonalDocuments(
      createDto,
    );
    return {
      message: 'Documentos personales subidos correctamente',
      documents: new PersonalDocumentsResponseDto(documents),
    };
  }

  @Put('update-personal-documents/:id')
  @UseInterceptors(PersonalDocumentsService.getFileFieldsInterceptor())
  async updatePersonalDocuments(
    @Param('id') id: string,
    @UploadedFiles() files,
  ) {
    const updateDto =
      await this.personalDocumentsService.processUploadedFilesForUpdate(files);
    const updatedDocuments =
      await this.personalDocumentsService.updatePersonalDocuments(
        id,
        updateDto,
      );
    return {
      message: 'Documentos personales actualizados correctamente',
      documents: new PersonalDocumentsResponseDto(updatedDocuments),
    };
  }

  @Get('list-personal-documents')
  async listPersonalDocuments() {
    const documents =
      await this.personalDocumentsService.getAllPersonalDocuments();
    return {
      message: 'Documentos personales obtenidos correctamente',
      documents: documents.map((d) => new PersonalDocumentsResponseDto(d)),
    };
  }

  @Get('personal-documents/:id')
  async getPersonalDocuments(@Param('id') id: string) {
    const documents =
      await this.personalDocumentsService.getPersonalDocumentsById(id);
    return {
      message: 'Documentos personales obtenidos correctamente',
      documents: new PersonalDocumentsResponseDto(documents),
    };
  }

  @Delete('delete-personal-documents/:id')
  async deletePersonalDocuments(@Param('id') id: string) {
    await this.personalDocumentsService.deletePersonalDocuments(id);
    return { message: 'Documentos personales eliminados correctamente' };
  }

  @Get('download/:id/:documentType')
  async downloadDocument(
    @Param('id') id: string,
    @Param('documentType') documentType: string,
    @Res() res: Response,
  ) {
    await this.personalDocumentsService.downloadDocument(id, documentType, res);
  }
}
