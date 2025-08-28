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
import { UserFolderService } from '../services/user-folder.service';

@Controller('api1/inscription')
export class InscriptionController {
  constructor(
    private readonly inscriptionService: InscriptionService,
    private readonly usersService: UsersService,
    private readonly userFolderService: UserFolderService,
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
    
    this.userFolderService.createUserFolderStructure(user.identification);
    const createInscriptionDto = await this.inscriptionService.processUploadedFilesForCreate(files, user.record.id);
    
    if (Object.keys(files).length > 0) {
      try {
        await this.moveFilesToUserFolder(files, user.identification, createInscriptionDto);
      } catch (error) {
        console.error('Error moviendo archivos:', error);
        throw new Error(`Error moviendo archivos: ${error.message}`);
      }
    }
    
    const inscription = await this.inscriptionService.saveInscriptionForm(createInscriptionDto);
    return {
        message: 'Formulario de inscripción subido correctamente',
        data: new InscriptionResponseDto(inscription),
    };
  } 

  @Put('update-inscription-form/:id')
  @UseGuards(AuthGuard('jwt-cookie'))
  @UseInterceptors(InscriptionService.getFileUploadInterceptor())
  async updateInscriptionForm(@Param('id') id: string, @UploadedFiles() files, @Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    
    this.userFolderService.createUserFolderStructure(user.identification);
    const updateInscriptionDto = await this.inscriptionService.processUploadedFilesForUpdate(files);
    
    if (Object.keys(files).length > 0) {
      try {
        await this.moveFilesToUserFolder(files, user.identification, updateInscriptionDto);
      } catch (error) {
        console.error('❌ Error moviendo archivos:', error);
        throw new Error(`Error moviendo archivos: ${error.message}`);
      }
    }
    
    const updatedInscription = await this.inscriptionService.updateInscriptionForm(id, updateInscriptionDto);
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

  private async moveFilesToUserFolder(
    files: any,
    userIdentification: string,
    createDto: any
  ): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    
    const tempFolder = path.join(process.cwd(), 'uploads', 'temp');
    const userFolder = path.join(process.cwd(), 'uploads', 'documentos-inscripcion', userIdentification);
    
    if (!fs.existsSync(tempFolder)) {
      console.error(`❌ Carpeta temporal no existe: ${tempFolder}`);
      throw new Error(`Carpeta temporal no existe: ${tempFolder}`);
    }
    
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    
    for (const field of Object.keys(createDto)) {
      if (createDto[field] && typeof createDto[field] === 'string') {
        const tempFilePath = path.join(tempFolder, createDto[field]);
        
        if (fs.existsSync(tempFilePath)) {
          try {
            const fileNamingService = new (await import('../services/file-naming.service')).FileNamingService();
            const standardFileName = fileNamingService.generateStandardFileName(
              field,
              userIdentification,
              files[field]?.[0]?.originalname
            );
            
            const ext = path.extname(createDto[field]);
            const finalFileName = `${standardFileName}${ext}`;
            const userFilePath = path.join(userFolder, finalFileName);
            
            fs.renameSync(tempFilePath, userFilePath);
            createDto[field] = finalFileName;
            
          } catch (error) {
            console.error(`Error moviendo archivo ${tempFilePath}:`, error);
            throw new Error(`Error moviendo archivo ${createDto[field]}: ${error.message}`);
          }
        } else {
          console.error(`Archivo temporal no encontrado: ${tempFilePath}`);
          throw new Error(`Archivo temporal no encontrado: ${createDto[field]}`);
        }
      }
    }
  }

  @Get('test-auth')
  @UseGuards(AuthGuard('jwt-cookie'))
  async testAuth(@Request() req) {
    return {
      message: 'Autenticación exitosa',
      user: req.user,
      cookies: req.cookies
    };
  }

  @Get('test-no-auth')
  async testNoAuth(@Request() req) {
    return {
      message: 'Endpoint sin autenticación',
      cookies: req.cookies,
      user: req.user
    };
  }
}
