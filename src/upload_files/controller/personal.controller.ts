import { getPersonalDocumentsByRecordId } from './../../../../unibe-filer-front/src/services/upload-files/personal-documents.service';
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
import { PersonalService } from '../services/personal.service';
import { Response } from 'express';
import { PersonalDocumentsResponseDto } from '../dto/personal-document/personal-document-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/services/user.service';

@Controller('api1/personal')
export class PersonalController {
  constructor(
    private readonly personalDocumentsService: PersonalService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload-personal-documents')
  @UseGuards(AuthGuard('jwt-cookie'))
  @UseInterceptors(PersonalService.getFileUploadInterceptor())
  async uploadPersonalDocuments(@UploadedFiles() files: Express.Multer.File[], @Request() req,) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const createDto = await this.personalDocumentsService.processUploadedFilesForCreate(files, user.record.id);
    const documents = await this.personalDocumentsService.savePersonalDocuments(createDto);
    return {
      message: 'Documentos personales subidos correctamente',
      personalDocuments: new PersonalDocumentsResponseDto(documents),
    };
  }

  @Put('update-personal-documents/:id')
  @UseInterceptors(PersonalService.getFileFieldsInterceptor())
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
      personalDocuments: new PersonalDocumentsResponseDto(updatedDocuments),
    };
  }

  @Get('list-personal-documents')
  async listPersonalDocuments() {
    const documents =
      await this.personalDocumentsService.getAllPersonalDocuments();
    return {
      message: 'Documentos personales obtenidos correctamente',
      personalDocuments: documents.map((d) => new PersonalDocumentsResponseDto(d)),
    };
  }

  @Get('personal-documents/:id')
  async getPersonalDocuments(@Param('id') id: string) {
    const documents =
      await this.personalDocumentsService.getPersonalDocumentsById(id);
    return {
      message: 'Documentos personales obtenidos correctamente',
      personalDocuments: new PersonalDocumentsResponseDto(documents),
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

  @Get('personal-docs/:id')
  @UseGuards(AuthGuard('jwt-cookie'))
  async getPersonalDocumentsByRecordId(@Param('id') id: string) {
    const documents =
      await this.personalDocumentsService.getPersonalDocumentsByRecordId(id);
    return {
      message: 'Documentos personales obtenidos correctamente',
      documents,
    };
  }
}
