import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';
import { PersonalDocumentsEntity } from '../entities/personal-documents.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdatePersonalDocumentsDto } from '../dto/personal-document/update-personal-document.dto';
import { RecordEntity } from '../entities/record.entity';
import { DocumentStatusEntity } from '../../core/entities/document-status.entity';
import { CoreRepositoryEnum } from 'src/core/enums/core-repository-enum';
import { EmailService } from '../../auth/services/email.service';
import { UsersService } from '../../auth/services/user.service';
import { UserFolderService } from './user-folder.service';

@Injectable()
export class PersonalService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.PERSONAL_DOCUMENTS_REPOSITORY)
    private readonly personalDocumentsRepository: Repository<PersonalDocumentsEntity>,
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
    @Inject(CoreRepositoryEnum.DOCUMENT_STATUS_REPOSITORY)
    private readonly documentStatusRepository: Repository<DocumentStatusEntity>,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly userFolderService: UserFolderService,
  ) {}



  static getFileFieldsInterceptor() {
    const fs = require('fs');
    const path = require('path');
    const tempPath = path.join(process.cwd(), 'uploads', 'temp');
    
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    return FileFieldsInterceptor(
      [
        { name: 'pictureDoc', maxCount: 1 },
        { name: 'dniDoc', maxCount: 1 },
        { name: 'votingBallotDoc', maxCount: 1 },
        { name: 'notarizDegreeDoc', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, callback) => {
            callback(null, tempPath);
          },
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const tempFileName = `${uniqueSuffix}${ext}`;
            
            if (!req['tempFileInfo']) {
              req['tempFileInfo'] = {};
            }
            req['tempFileInfo'][file.fieldname] = {
              originalName: file.originalname,
              fieldName: file.fieldname,
              tempFileName: tempFileName
            };
            
            callback(null, tempFileName);
          },
        }),
        fileFilter: (req, file, callback) => {
          if (file.mimetype === 'application/pdf') {
            callback(null, true);
          } else {
            callback(new Error('Solo se permiten archivos PDF'), false);
          }
        },
      },
    );
  }



  async processUploadedFilesForUpdate(files: {
    pictureDoc?: Express.Multer.File[];
    dniDoc?: Express.Multer.File[];
    votingBallotDoc?: Express.Multer.File[];
    notarizDegreeDoc?: Express.Multer.File[];
  }): Promise<UpdatePersonalDocumentsDto> {
    const updates: UpdatePersonalDocumentsDto = {};

    if (files.pictureDoc?.[0])
      updates.pictureDoc = files.pictureDoc[0].filename;
    if (files.dniDoc?.[0]) updates.dniDoc = files.dniDoc[0].filename;
    if (files.votingBallotDoc?.[0])
      updates.votingBallotDoc = files.votingBallotDoc[0].filename;
    if (files.notarizDegreeDoc?.[0])
      updates.notarizDegreeDoc = files.notarizDegreeDoc[0].filename;
    return updates;
  }

  async createInitialPersonalDocuments(recordId: string): Promise<PersonalDocumentsEntity> {
    const record = await this.recordRepository.findOne({
      where: { id: recordId },
    });
    if (!record) {
      throw new NotFoundException(`Record con ID ${recordId} no encontrado`);
    }

    const personalDocuments = this.personalDocumentsRepository.create({
      record: record,
      pictureDoc: null,
      dniDoc: null,
      votingBallotDoc: null,
      notarizDegreeDoc: null,
    });

    return this.personalDocumentsRepository.save(personalDocuments);
  }



  async updatePersonalDocuments(
    id: string,
    updateDto: UpdatePersonalDocumentsDto,
  ): Promise<PersonalDocumentsEntity> {
    const documents = await this.personalDocumentsRepository.findOne({
      where: { id },
      relations: ['record', 'record.user'],
    });
    if (!documents) {
      throw new NotFoundException(
        `Documentos personales con ID ${id} no encontrados`,
      );
    }
    if (updateDto.pictureDocStatus) {
      documents.pictureDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.pictureDocStatus } });
    }
    if (updateDto.dniDocStatus) {
      documents.dniDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.dniDocStatus } });
    }
    if (updateDto.votingBallotDocStatus) {
      documents.votingBallotDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.votingBallotDocStatus } });
    }
    if (updateDto.notarizDegreeDocStatus) {
      documents.notarizDegreeDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.notarizDegreeDocStatus } });
    }
    Object.assign(documents, updateDto);
    const updated = await this.personalDocumentsRepository.save(documents);

    const statusFields = [
      'pictureDocStatus',
      'dniDocStatus',
      'votingBallotDocStatus',
      'notarizDegreeDocStatus',
    ];
    const documentTypeNames: Record<string, string> = {
      pictureDocStatus: 'Foto de tamaño carnet',
      dniDocStatus: 'Copia de cédula',
      votingBallotDocStatus: 'Papeleta de votación',
      notarizDegreeDocStatus: 'Título notarizado',
    };
    for (const field of statusFields) {
      let status = documents[field];
      if (status && typeof status === 'string') {
        const statusObj = await this.documentStatusRepository.findOne({ where: { id: status } });
        status = statusObj;
      }
      if (status && status.name && status.name.toLowerCase() === 'rechazado') {
        const user = documents.record?.user;
        if (user && user.email) {
          const userName = `${user.names} ${user.last_names}`;
          const documentTypeFriendly = documentTypeNames[field] || field;
          const reason = 'Por favor, revise que la documentacion sea la correcta y vuelva a subirlo.';
          await this.emailService.sendRejectionEmail(user.email, userName, documentTypeFriendly, reason);
          const docField = field.replace('Status', '');
          await this.deleteFileIfRejected(documents, docField);
        }
      } 
    }
    return updated;
  }

  async getAllPersonalDocuments(): Promise<PersonalDocumentsEntity[]> {
    return this.personalDocumentsRepository.find({
      relations: [
        'pictureDocStatus',
        'dniDocStatus',
        'votingBallotDocStatus',
        'notarizDegreeDocStatus',
      ],
    });
  }

  async getPersonalDocumentsById(id: string): Promise<PersonalDocumentsEntity> {
    const documents = await this.personalDocumentsRepository.findOne({
      where: { id },
      relations: [
        'pictureDocStatus',
        'dniDocStatus',
        'votingBallotDocStatus',
        'notarizDegreeDocStatus',
      ],
    });
    if (!documents) {
      throw new NotFoundException(
        `Documentos personales con ID ${id} no encontrados`,
      );
    }
    return documents;
  }

  async deletePersonalDocuments(id: string): Promise<void> {
    const result = await this.personalDocumentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Documentos personales con ID ${id} no encontrados`,
      );
    }
  }

  async downloadDocument(
    id: string,
    documentType: string,
    res: Response,
  ): Promise<void> {
    const documents = await this.personalDocumentsRepository.findOne({
      where: { id },
      relations: ['record', 'record.user'],
    });
    if (!documents) {
      throw new NotFoundException(
        `Documentos personales con ID ${id} no encontrados`,
      );
    }

    const documentField = this.mapDocumentTypeToField(documentType);
    const filename = documents[documentField];
    if (!filename) {
      throw new NotFoundException(`Documento ${documentType} no encontrado`);
    }

    const userIdentification = documents.record?.user?.identification;
    if (!userIdentification) {
      throw new NotFoundException('No se pudo identificar al usuario');
    }
    const filePath = path.join(process.cwd(), 'uploads', 'documentos-personales', userIdentification, filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `Archivo ${filename} no encontrado en el servidor`,
      );
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    fs.createReadStream(filePath).pipe(res);
  }

  private mapDocumentTypeToField(documentType: string): string {
    const mapping = {
      picture: 'pictureDoc',
      dni: 'dniDoc',
      voting_ballot: 'votingBallotDoc',
      notariz_degree: 'notarizDegreeDoc',
    };

    if (!mapping[documentType]) {
      throw new NotFoundException(
        `Tipo de documento ${documentType} no válido`,
      );
    }

    return mapping[documentType];
  }

   async getPersonalDocumentsByRecordId(recordId: string): Promise<PersonalDocumentsEntity | null> {
    return this.personalDocumentsRepository.findOne({
      where: { record: { id: recordId } },
      relations: [
        'pictureDocStatus',
        'dniDocStatus',
        'votingBallotDocStatus',
        'notarizDegreeDocStatus',
      ],
    });
  }

  async deleteFile(id: string, field: string): Promise<void> {
    const validFields = ['pictureDoc', 'dniDoc', 'votingBallotDoc', 'notarizDegreeDoc'];
    if (!validFields.includes(field)) {
      throw new BadRequestException('Campo de documento inválido');
    }
    const doc = await this.personalDocumentsRepository.findOne({ 
      where: { id },
      relations: ['record', 'record.user']
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    const filename = doc[field];
    if (filename) {
      const userIdentification = doc.record?.user?.identification;
      if (!userIdentification) {
        throw new NotFoundException('No se pudo identificar al usuario');
      }
      const filePath = path.join(process.cwd(), 'uploads', 'documentos-personales', userIdentification, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      doc[field] = null;
      await this.personalDocumentsRepository.save(doc);
    }
  }

  private async deleteFileIfRejected(documents: PersonalDocumentsEntity, field: string) {
    const filename = documents[field];
    if (filename) {
      const userIdentification = documents.record?.user?.identification;
      if (userIdentification) {
        const filePath = path.join(process.cwd(), 'uploads', 'documentos-personales', userIdentification, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      documents[field] = null;
      await this.personalDocumentsRepository.save(documents);
    }
  }
}
