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
import { InscriptionFormService } from '../services/inscription-form.service';
import { Response } from 'express';
import { InscriptionResponseDto } from '../dto/inscription-document/inscription-response.dto';

@Controller('files')
export class UploadInscriptionFormController {
  constructor(
    private readonly inscriptionFormService: InscriptionFormService,
  ) {}

  @Post('upload-inscription-form')
  @UseInterceptors(InscriptionFormService.getFileUploadInterceptor())
  async uploadInscriptionForm(@UploadedFiles() files) {
    const createInscriptionDto =
      await this.inscriptionFormService.processUploadedFilesForCreate(files);
    const inscription = await this.inscriptionFormService.saveInscriptionForm(
      createInscriptionDto,
    );
    return {
      message: 'Formulario de inscripción subido correctamente',
      inscriptionForms: new InscriptionResponseDto(inscription),
    };
  }

  @Put('update-inscription-form/:id')
  @UseInterceptors(InscriptionFormService.getFileUploadInterceptor())
  async updateInscriptionForm(@Param('id') id: string, @UploadedFiles() files) {
    const updateInscriptionDto =
      await this.inscriptionFormService.processUploadedFilesForUpdate(files);
    const updatedInscription =
      await this.inscriptionFormService.updateInscriptionForm(
        id,
        updateInscriptionDto,
      );
    return {
      message: 'Formulario de inscripción actualizado correctamente',
      inscriptionForms: new InscriptionResponseDto(updatedInscription),
    };
  }

  @Get('list-inscription-forms')
  async listInscriptionForms() {
    const inscriptions =
      await this.inscriptionFormService.getAllInscriptionForms();
    return {
      message: 'Formularios de inscripción obtenidos correctamente',
      inscriptionForms: inscriptions.map((i) => new InscriptionResponseDto(i)),
    };
  }

  @Get('inscription-form/:id')
  async getInscriptionForm(@Param('id') id: string) {
    const inscription =
      await this.inscriptionFormService.getInscriptionFormById(id);
    return {
      message: 'Formulario de inscripción obtenido correctamente',
      inscriptionForms: new InscriptionResponseDto(inscription),
    };
  }

  @Delete('delete-inscription-form/:id')
  async deleteInscriptionForm(@Param('id') id: string) {
    await this.inscriptionFormService.deleteInscriptionForm(id);
    return { message: 'Formulario de inscripción eliminado correctamente' };
  }

  @Get('download/:id/:documentType')
  async downloadDocument(
    @Param('id') id: string,
    @Param('documentType') documentType: string,
    @Res() res: Response,
  ) {
    await this.inscriptionFormService.downloadDocument(id, documentType, res);
  }
}
