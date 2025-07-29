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
  async uploadPersonalDocuments(@UploadedFiles() files: Express.Multer.File[], @Request() req, @Body() body) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const createDto = await this.personalDocumentsService.processUploadedFilesForCreate(files, user.record.id);
    createDto.pictureDocStatus = body.pictureDocStatus;
    createDto.dniDocStatus = body.dniDocStatus;
    createDto.votingBallotDocStatus = body.votingBallotDocStatus;
    createDto.notarizDegreeDocStatus = body.notarizDegreeDocStatus;
    const documents = await this.personalDocumentsService.savePersonalDocuments(createDto);
    return {
      message: 'Documentos personales subidos correctamente',
      data: new PersonalDocumentsResponseDto(documents),
    };
  }

  @Put('update-personal-documents/:id')
  @UseInterceptors(PersonalService.getFileFieldsInterceptor())
  async updatePersonalDocuments(
    @Param('id') id: string,
    @UploadedFiles() files,
    @Body() body,
  ) {
    const updateDto = await this.personalDocumentsService.processUploadedFilesForUpdate(files);
    updateDto.pictureDocStatus = body.pictureDocStatus;
    updateDto.dniDocStatus = body.dniDocStatus;
    updateDto.votingBallotDocStatus = body.votingBallotDocStatus;
    updateDto.notarizDegreeDocStatus = body.notarizDegreeDocStatus;
    const updatedDocuments = await this.personalDocumentsService.updatePersonalDocuments(id, updateDto);
    return {
      message: 'Documentos personales actualizados correctamente',
      data: new PersonalDocumentsResponseDto(updatedDocuments),
    };
  }

  @Get('list-personal-documents')
  @UseGuards(AuthGuard('jwt-cookie'))
  async listPersonalDocuments(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const document = await this.personalDocumentsService.getPersonalDocumentsByRecordId(user.record.id);
    return {
      message: 'Documento personal obtenido correctamente',
      data: document ? new PersonalDocumentsResponseDto(document) : null,
    };
  }

  @Get('personal-documents/:id')
  async getPersonalDocuments(@Param('id') id: string) {
    const documents =
      await this.personalDocumentsService.getPersonalDocumentsById(id);
    return {
      message: 'Documentos personales obtenidos correctamente',
      data: new PersonalDocumentsResponseDto(documents),
    };
  }

  @Delete('delete-personal-documents/:id')
  async deletePersonalDocuments(@Param('id') id: string) {
    await this.personalDocumentsService.deletePersonalDocuments(id);
    return { message: 'Documentos personales eliminados correctamente' };
  }

  @Delete('delete-file/:id/:field')
  async deleteFile(@Param('id') id: string, @Param('field') field: string) {
    await this.personalDocumentsService.deleteFile(id, field);
    return { message: 'Archivo eliminado correctamente' };
  }

  @Get('download/:id/:documentType')
  async downloadDocument(
    @Param('id') id: string,
    @Param('documentType') documentType: string,
    @Res() res: Response,
  ) {
    await this.personalDocumentsService.downloadDocument(id, documentType, res);
  }

  @Get('record/:id')
  @UseGuards(AuthGuard('jwt-cookie'))
  async getPersonalDocumentsByRecordId(@Param('id') id: string) {
    const document = await this.personalDocumentsService.getPersonalDocumentsByRecordId(id);
    return {
      message: 'Documento personal obtenido correctamente',
      data: document ? new PersonalDocumentsResponseDto(document) : null,
    };
  }
}
