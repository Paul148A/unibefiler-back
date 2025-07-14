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
import { InscriptionService } from '../services/inscription.service';
import { Response } from 'express';
import { InscriptionResponseDto } from '../dto/inscription-document/inscription-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/services/user.service';
import { UpdateStatusDto } from '../dto/inscription-document/update-status.dto';

@Controller('api1/inscription')
export class InscriptionController {
  constructor(
    private readonly inscriptionService: InscriptionService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload-inscription-form')
  @UseGuards(AuthGuard('jwt-cookie'))
  @UseInterceptors(InscriptionService.getFileUploadInterceptor())
  async uploadInscriptionForm(@UploadedFiles() files, @Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
        throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const createInscriptionDto = await this.inscriptionService.processUploadedFilesForCreate(files, user.record.id);
    const inscription = await this.inscriptionService.saveInscriptionForm(createInscriptionDto);
    return {
        message: 'Formulario de inscripción subido correctamente',
        data: new InscriptionResponseDto(inscription),
    };
  } 

  @Put('update-inscription-form/:id')
  @UseInterceptors(InscriptionService.getFileUploadInterceptor())
  async updateInscriptionForm(@Param('id') id: string, @UploadedFiles() files) {
    const updateInscriptionDto =
      await this.inscriptionService.processUploadedFilesForUpdate(files);
    const updatedInscription =
      await this.inscriptionService.updateInscriptionForm(
        id,
        updateInscriptionDto,
      );
    return {
      message: 'Formulario de inscripción actualizado correctamente',
      data: new InscriptionResponseDto(updatedInscription),
    };
  }

  @Get('inscription-form/:id')
  async getInscriptionForm(@Param('id') id: string) {
    const inscription =
      await this.inscriptionService.getInscriptionFormById(id);
    return {
      message: 'Formulario de inscripción obtenido correctamente',
      data: new InscriptionResponseDto(inscription),
    };
  }

  @Delete('delete-inscription-form/:id')
  async deleteInscriptionForm(@Param('id') id: string) {
    await this.inscriptionService.deleteInscriptionForm(id);
    return { message: 'Formulario de inscripción eliminado correctamente' };
  }

  @Delete('delete-file/:id/:field')
  async deleteFile(@Param('id') id: string, @Param('field') field: string) {
    await this.inscriptionService.deleteFile(id, field);
    return { message: 'Archivo eliminado correctamente' };
  }

  @Get('download/:id/:documentType')
  async downloadDocument(
    @Param('id') id: string,
    @Param('documentType') documentType: string,
    @Res() res: Response,
  ) {
    await this.inscriptionService.downloadDocument(id, documentType, res);
  }

  @Get('record/:id')
  @UseGuards(AuthGuard('jwt-cookie'))
  async getInscriptionDocumentsByRecordId(@Param('id') id: string) {
    const documents = await this.inscriptionService.getInscriptionDocumentsByRecordId(id);
    return {
      message: 'Documentos de inscripción obtenidos correctamente',
      data: documents ? new InscriptionResponseDto(documents) : null,
    };
  }

  @Patch('update-status/:id')
  async updateCertificateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    const inscription = await this.inscriptionService.updateCertificateStatus(id, updateStatusDto);
    return {
      message: 'Estado del certificado actualizado correctamente',
      data: new InscriptionResponseDto(inscription)
    };
  }
}
