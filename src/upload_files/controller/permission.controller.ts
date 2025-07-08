import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Put,
  Param,
  Delete,
  Res,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { Response } from 'express';
import { PermissionDocumentsResponseDto } from '../dto/permission-document/permission-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/services/user.service';
import { RolesGuard } from 'src/auth/custom-role-guard/roles.guard';
import { Roles } from 'src/auth/custom-role-guard/roles.decorator';

@Controller('api1/permission')
@UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
export class PermissionController {
  constructor(
    private readonly permissionDocumentsService: PermissionService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload-permission-document/')
  @Roles('teacher')
  @UseInterceptors(PermissionService.getFileUploadInterceptor())
  async uploadPermissionDocument(
    @UploadedFile() file: Express.Multer.File,
    @Param('recordId') recordId: string,
    @Request() req,
  ) {
    const createDto = await this.permissionDocumentsService.processUploadedFileForCreate(
      file,
      recordId
    );
    const document = await this.permissionDocumentsService.savePermissionDocuments(createDto);
    return {
      message: 'Documento de respaldo subido correctamente',
      data: new PermissionDocumentsResponseDto(document),
    };
  }

  @Put('update-permission-document/:id')
  @Roles('teacher')
  @UseInterceptors(PermissionService.getFileUploadInterceptor())
  async updatePermissionDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updateDto: any = {};
    if (file) updateDto.supportingDoc = file.filename;
    const updatedDocument = await this.permissionDocumentsService.updatePermissionDocuments(
      id,
      updateDto,
    );
    return {
      message: 'Documento de respaldo actualizado correctamente',
      data: new PermissionDocumentsResponseDto(updatedDocument),
    };
  }

  @Get('list-permission-documents')
  @Roles('teacher')
  async listPermissionDocuments() {
    const documents = await this.permissionDocumentsService.getAllPermissionDocuments();
    return {
      message: 'Documentos de respaldo obtenidos correctamente',
      data: documents.map((d) => new PermissionDocumentsResponseDto(d)),
    };
  }

  @Get('permission-document/:id')
  @Roles('teacher')
  async getPermissionDocument(@Param('id') id: string) {
    const document = await this.permissionDocumentsService.getPermissionDocumentsById(id);
    return {
      message: 'Documento de respaldo obtenido correctamente',
      data: new PermissionDocumentsResponseDto(document),
    };
  }

  @Delete('delete-permission-document/:id')
  @Roles('teacher')
  async deletePermissionDocument(@Param('id') id: string) {
    await this.permissionDocumentsService.deletePermissionDocuments(id);
    return { message: 'Documento de respaldo eliminado correctamente' };
  }

  @Get('download/:id')
  @Roles('teacher')
  async downloadDocument(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    await this.permissionDocumentsService.downloadDocument(id, res);
  }

  @Get('record/:id')
  @Roles('teacher')
  async getPermissionDocumentsByRecordId(@Param('id') id: string) {
    const documents = await this.permissionDocumentsService.getPermissionDocumentsByRecordId(id);
    return {
      message: 'Documentos de respaldo obtenidos correctamente',
      data: documents.map((d) => new PermissionDocumentsResponseDto(d)),
    };
  }

  @Get('student-permissions')
  @Roles('student')
  async getStudentPermissions(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findOne(userId);
    if (!user.record) {
      throw new NotFoundException('El usuario no tiene un record asociado');
    }
    const documents = await this.permissionDocumentsService.getPermissionDocumentsByRecordId(user.record.id);
    return {
      message: 'Documentos de respaldo obtenidos correctamente',
      data: documents.map((d) => new PermissionDocumentsResponseDto(d)),
    };
  }
} 