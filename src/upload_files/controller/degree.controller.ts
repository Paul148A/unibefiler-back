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
import { DegreeService } from '../services/degree.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/services/user.service';
import { DegreeResponseDto } from '../dto/degree-document/degree-response.dto';
import { DegreeDocumentsEntity } from '../entities/degree-documents.entity';
import { UpdateDegreeStatusDto } from '../dto/degree-document/update-degree.dto';
import { UserFolderService } from '../services/user-folder.service';

@Controller('api1/degree')
export class DegreeController {
  constructor(
    private readonly degreeService: DegreeService,
    private readonly usersService: UsersService,
    private readonly userFolderService: UserFolderService,
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
    
    this.userFolderService.createUserFolderStructure(user.identification);
    
    const createDegreeDto = await this.degreeService.processUploadedFiles(files, user.record.id);
    
    if (Object.keys(files).length > 0) {
      try {
        await this.moveFilesToUserFolder(files, user.identification, createDegreeDto);
      } catch (error) {
        console.error('❌ Error moviendo archivos:', error);
        throw new Error(`Error moviendo archivos: ${error.message}`);
      }
    }
    
    await this.degreeService.saveDegree(createDegreeDto);
    return { message: 'Documentos de grado subidos correctamente' };
  }

  @Put('update-degree/:id')
  @UseGuards(AuthGuard('jwt-cookie'))
  @UseInterceptors(DegreeService.getFileUploadInterceptor())
  async updateDegree(@Param('id') id: string, @UploadedFiles() files, @Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    
    this.userFolderService.createUserFolderStructure(user.identification);
    
    const UpdateDegreeDto = await this.degreeService.processUploadedFilesForUpdate(files);
    
    if (Object.keys(files).length > 0) {
      try {
        await this.moveFilesToUserFolder(files, user.identification, UpdateDegreeDto);
      } catch (error) {
        console.error('❌ Error moviendo archivos:', error);
        throw new Error(`Error moviendo archivos: ${error.message}`);
      }
    }
    
    const updatedDegree = await this.degreeService.updateDegreeForm(id, UpdateDegreeDto);
    return {
      message: 'Formulario de inscripción actualizado correctamente',
      data: new DegreeResponseDto(updatedDegree),
    };
  }

  @Patch('update-degree-status/:id')
  async updateDegreeStatus(@Param('id') id: string, @Body() dto: UpdateDegreeStatusDto) {
    const updated = await this.degreeService.updateDegreeStatus(id, dto);
    return {
      message: 'Estado actualizado correctamente',
      data: new DegreeResponseDto(updated),
    };
  }

  @Get('list-degrees')
  @UseGuards(AuthGuard('jwt-cookie'))
  async listDegrees(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const document = await this.degreeService.getDegreeDocumentsByRecordId(user.record.id);
    return {
      message: 'Documento de grado obtenido correctamente',
      data: document ? new DegreeResponseDto(document) : null,
    };
  }

  @Get('degree/:id')
  async getDegree(@Param('id') id: string) {
    const degree = await this.degreeService.getDegreeById(id);
    return { message: 'Documento de grado obtenido correctamente', data: new DegreeResponseDto(degree) };
  }

  @Delete('delete-degree/:id')
  async deleteDegree(@Param('id') id: string) {
    await this.degreeService.deleteDegree(id);
    return { message: 'Documento de grado eliminado correctamente' };
  }

  @Delete('delete-file/:id/:field')
  async deleteFile(@Param('id') id: string, @Param('field') field: string) {
    await this.degreeService.deleteFile(id, field);
    return { message: 'Archivo eliminado correctamente' };
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
    const document = await this.degreeService.getDegreeDocumentsByRecordId(id);
    return {
      message: 'Documento de grado obtenido correctamente',
      data: document ? new DegreeResponseDto(document) : null,
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
    const userFolder = path.join(process.cwd(), 'uploads', 'documentos-grado', userIdentification);
    
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
