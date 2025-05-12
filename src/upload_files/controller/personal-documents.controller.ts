import { Controller, Post, UploadedFiles, UseInterceptors, BadRequestException, Get, Put, Param, NotFoundException, Delete } from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
  FileFieldsInterceptor([
    { name: 'pictureDoc', maxCount: 1 },
    { name: 'dniDoc', maxCount: 1 },
    { name: 'votingBallotDoc', maxCount: 1 },
    { name: 'notarizDegreeDoc', maxCount: 1 },
  ], {
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
  @UploadedFiles() files: {
    pictureDoc?: Express.Multer.File[];
    dniDoc?: Express.Multer.File[];
    votingBallotDoc?: Express.Multer.File[];
    notarizDegreeDoc?: Express.Multer.File[];
  },
) {
  const updates: Partial<{
    pictureDoc: string;
    dniDoc: string;
    votingBallotDoc: string;
    notarizDegreeDoc: string;
  }> = {};

  if (files.pictureDoc?.[0]) updates.pictureDoc = files.pictureDoc[0].filename;
  if (files.dniDoc?.[0]) updates.dniDoc = files.dniDoc[0].filename;
  if (files.votingBallotDoc?.[0]) updates.votingBallotDoc = files.votingBallotDoc[0].filename;
  if (files.notarizDegreeDoc?.[0]) updates.notarizDegreeDoc = files.notarizDegreeDoc[0].filename;

  if (Object.keys(updates).length === 0) {
    throw new BadRequestException('No se proporcionaron archivos para actualizar');
  }

  const updatedDocument = await this.personalDocumentsService.updatePersonalDocuments(id, updates);
  return { 
    message: 'Documentos actualizados correctamente', 
    personalDocuments: updatedDocument 
  };
}

  @Get('list-personal-documents')
  async listPersonalDocuments() {
    const personalDocuments = await this.personalDocumentsService.getAllPersonalDocuments();
    return { message: 'Documentos personales obtenidos correctamente', personalDocuments };
  }

  @Delete('delete-personal-documents/:id')
async deletePersonalDocuments(@Param('id') id: string) {
  const result = await this.personalDocumentsService.deletePersonalDocuments(id);
  if (result.affected === 0) {
    throw new NotFoundException(`Documentos personales con ID ${id} no encontrados`);
  }
  return { message: 'Documentos personales eliminados correctamente' };
}

}