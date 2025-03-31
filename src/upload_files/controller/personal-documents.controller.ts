import { Controller, Post, UploadedFiles, UseInterceptors, BadRequestException, Get, Put, Param, NotFoundException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PersonalDocumentsService } from '../services/personal-documents.service';

@Controller('files')
export class UploadPersonalDocumentsController {
  constructor(private readonly personalDocumentsService: PersonalDocumentsService) {}

  @Post('upload-personal-documents')
  @UseInterceptors(
    FilesInterceptor('files', 4, {
      storage: diskStorage({
        destination: './uploads/documentos-personales',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    }),
  )
  async uploadPersonalDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length !== 4) {
      throw new BadRequestException('Debes subir exactamente 4 archivos');
    }

    const [pictureDoc, dniDoc, votingBallotDoc, notarizDegreeDoc] = files.map(
      (file) => file.filename,
    );

    await this.personalDocumentsService.savePersonalDocuments(
      pictureDoc,
      dniDoc,
      votingBallotDoc,
      notarizDegreeDoc,
    );

    return { message: 'Documentos personales subidos correctamente' };
  }

  @Put('update-personal-documents/:id')
  @UseInterceptors(
    FilesInterceptor('files', 4, {
      storage: diskStorage({
        destination: './uploads/documentos-personales',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    }),
  )
  async updatePersonalDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    if (files.length !== 4) {
      throw new BadRequestException('Debes subir exactamente 4 archivos');
    }

    const [pictureDoc, dniDoc, votingBallotDoc, notarizDegreeDoc] = files.map(
      (file) => file.filename,
    );

    const updatedFiles = {
      pictureDoc,
      dniDoc,
      votingBallotDoc,
      notarizDegreeDoc,
    };

    const updatedPersonalDocuments = await this.personalDocumentsService.updatePersonalDocuments(id, updatedFiles);
    return { message: 'Documentos personales actualizados correctamente', personalDocuments: updatedPersonalDocuments };
  }

  @Get('list-personal-documents')
  async listPersonalDocuments() {
    const personalDocuments = await this.personalDocumentsService.getAllPersonalDocuments();
    return { message: 'Documentos personales obtenidos correctamente', personalDocuments };
  }

}