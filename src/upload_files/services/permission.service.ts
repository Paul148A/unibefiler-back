import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PermissionDocumentsEntity } from '../entities/permission-documents.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {
  FileInterceptor
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePermissionDocumentsDto } from '../dto/permission-document/create-permission.dto';
import { UpdatePermissionDocumentsDto } from '../dto/permission-document/update-permission.dto';
import { RecordEntity } from '../entities/record.entity';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.PERMISSION_DOCUMENTS_REPOSITORY)
    private readonly permissionDocumentsRepository: Repository<PermissionDocumentsEntity>,
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
  ) {}

  static getFileUploadInterceptor() {
    return FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documentos-permisos',
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
    });
  }

  async processUploadedFileForCreate(
    file: Express.Multer.File,
    record_id: string,
  ): Promise<CreatePermissionDocumentsDto> {
    if (!file) {
      throw new BadRequestException('Debes subir un archivo');
    }

    const record = await this.recordRepository.findOne({
      where: { id: record_id },
    });

    if (!record) {
      throw new NotFoundException(`Record con ID ${record_id} no encontrado`);
    }

    return {
      record_id,
      supportingDoc: file.filename,
    };
  }

  async processUploadedFileForUpdate(files: { supportingDoc?: Express.Multer.File[] }): Promise<UpdatePermissionDocumentsDto> {
    const updates: UpdatePermissionDocumentsDto = {};
    if (files.supportingDoc?.[0])
      updates.supportingDoc = files.supportingDoc[0].filename;
    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No se proporcionó archivo para actualizar');
    }
    return updates;
  }

  async savePermissionDocuments(
    createDto: CreatePermissionDocumentsDto,
  ): Promise<PermissionDocumentsEntity> {
    const record = await this.recordRepository.findOne({
      where: { id: createDto.record_id },
    });
    if (!record) {
      throw new NotFoundException(`Record con ID ${createDto.record_id} no encontrado`);
    }
    const documents = this.permissionDocumentsRepository.create({
      ...createDto,
      record: record,
    });
    return this.permissionDocumentsRepository.save(documents);
  }

  async updatePermissionDocuments(
    id: string,
    updateDto: UpdatePermissionDocumentsDto,
  ): Promise<PermissionDocumentsEntity> {
    const documents = await this.permissionDocumentsRepository.findOne({
      where: { id },
    });
    if (!documents) {
      throw new NotFoundException(`Documento de permiso con ID ${id} no encontrado`);
    }
    Object.assign(documents, updateDto);
    return this.permissionDocumentsRepository.save(documents);
  }

  async getAllPermissionDocuments(): Promise<PermissionDocumentsEntity[]> {
    return this.permissionDocumentsRepository.find({
      relations: ['record'],
    });
  }

  async getPermissionDocumentsById(id: string): Promise<PermissionDocumentsEntity> {
    const documents = await this.permissionDocumentsRepository.findOne({
      where: { id },
      relations: ['record'],
    });
    if (!documents) {
      throw new NotFoundException(`Documento de permiso con ID ${id} no encontrado`);
    }
    return documents;
  }

  async deletePermissionDocuments(id: string): Promise<void> {
    const result = await this.permissionDocumentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Documento de permiso con ID ${id} no encontrado`);
    }
  }

  async downloadDocument(
    id: string,
    res: Response,
  ): Promise<void> {
    const documents = await this.getPermissionDocumentsById(id);
    const filename = documents.supportingDoc;
    if (!filename) {
      throw new NotFoundException('Archivo no encontrado');
    }
    const filePath = path.join(process.cwd(), 'uploads', 'documentos-permisos', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo no encontrado');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  async getPermissionDocumentsByRecordId(recordId: string): Promise<PermissionDocumentsEntity[]> {
    return this.permissionDocumentsRepository.find({
      where: { record: { id: recordId } },
      relations: ['record'],
    });
  }
} 