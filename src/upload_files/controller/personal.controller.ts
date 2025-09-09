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



  @Put('update-personal-documents/:id')
  @UseGuards(AuthGuard('jwt-cookie'))
  @UseInterceptors(PersonalService.getFileFieldsInterceptor())
  async updatePersonalDocuments(
    @Param('id') id: string,
    @Request() req,
    @UploadedFiles() files: {
      pictureDoc?: Express.Multer.File[];
      dniDoc?: Express.Multer.File[];
      votingBallotDoc?: Express.Multer.File[];
      notarizDegreeDoc?: Express.Multer.File[];
    },
    @Body() body,
  ) {
    
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    
    const userFolderService = new (await import('../services/user-folder.service')).UserFolderService();
    userFolderService.createUserFolderStructure(user.identification);
    
    let updateDto: any = {};
    if (files) {
      updateDto = await this.personalDocumentsService.processUploadedFilesForUpdate(files);
      
      if (Object.keys(updateDto).length > 0) {
        try {
          await this.moveFilesToUserFolder(files, user.identification, updateDto);
        } catch (error) {
          console.error('❌ Error moviendo archivos:', error);
          throw new Error(`Error moviendo archivos: ${error.message}`);
        }
      }
    }
    
    if (body.pictureDocStatus) updateDto.pictureDocStatus = body.pictureDocStatus;
    if (body.dniDocStatus) updateDto.dniDocStatus = body.dniDocStatus;
    if (body.votingBallotDocStatus) updateDto.votingBallotDocStatus = body.votingBallotDocStatus;
    if (body.notarizDegreeDocStatus) updateDto.notarizDegreeDocStatus = body.notarizDegreeDocStatus;
    
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

  @Get('test-auth')
  @UseGuards(AuthGuard('jwt-cookie'))
  async testAuth(@Request() req) {
    return {
      message: 'Autenticación exitosa',
      user: req.user,
      cookies: req.cookies
    };
  }

  @Patch('update-personal-status/:id')
  async updatePersonalStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { field: string; statusId: string }
  ) {
    const updated = await this.personalDocumentsService.updatePersonalStatus(id, updateStatusDto);
    return {
      message: 'Estado actualizado correctamente',
      data: new PersonalDocumentsResponseDto(updated),
    };
  }

  private async moveFilesToUserFolder(
    files: any,
    userIdentification: string,
    updateDto: any
  ): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    
    const tempFolder = path.join(process.cwd(), 'uploads', 'temp');
    const userFolder = path.join(process.cwd(), 'uploads', 'documentos-personales', userIdentification);
    
    if (!fs.existsSync(tempFolder)) {
      console.error(`Carpeta temporal no existe: ${tempFolder}`);
      throw new Error(`Carpeta temporal no existe: ${tempFolder}`);
    }
    
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    
    for (const field of Object.keys(updateDto)) {
      if (updateDto[field] && typeof updateDto[field] === 'string') {
        const tempFilePath = path.join(tempFolder, updateDto[field]);
        
        if (fs.existsSync(tempFilePath)) {
          try {
            const fileNamingService = new (await import('../services/file-naming.service')).FileNamingService();
            const standardFileName = fileNamingService.generateStandardFileName(
              field,
              userIdentification,
              files[field]?.[0]?.originalname
            );
      
            const ext = path.extname(updateDto[field]);
            const finalFileName = `${standardFileName}${ext}`;
            const userFilePath = path.join(userFolder, finalFileName);
            
            fs.renameSync(tempFilePath, userFilePath);
            updateDto[field] = finalFileName;
            
          } catch (error) {
            console.error(`Error moviendo archivo ${tempFilePath}:`, error);
            throw new Error(`Error moviendo archivo ${updateDto[field]}: ${error.message}`);
          }
        } else {
          console.error(`Archivo temporal no encontrado: ${tempFilePath}`);
          throw new Error(`Archivo temporal no encontrado: ${updateDto[field]}`);
        }
      }
    }
  }
}
