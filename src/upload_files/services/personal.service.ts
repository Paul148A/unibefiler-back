import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';
import { PersonalDocumentsEntity } from '../entities/personal-documents.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePersonalDocumentsDto } from '../dto/personal-document/create-personal-document.dto';
import { UpdatePersonalDocumentsDto } from '../dto/personal-document/update-personal-document.dto';
import { RecordEntity } from '../entities/record.entity';

@Injectable()
export class PersonalService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.PERSONAL_DOCUMENTS_REPOSITORY)
    private readonly personalDocumentsRepository: Repository<PersonalDocumentsEntity>,
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
  ) {}

  static getFileUploadInterceptor() {
    return FilesInterceptor('files', 4, {
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
    });
  }

  static getFileFieldsInterceptor() {
    return FileFieldsInterceptor(
      [
        { name: 'pictureDoc', maxCount: 1 },
        { name: 'dniDoc', maxCount: 1 },
        { name: 'votingBallotDoc', maxCount: 1 },
        { name: 'notarizDegreeDoc', maxCount: 1 },
      ],
      {
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
      },
    );
  }

  async processUploadedFilesForCreate(
    files: Express.Multer.File[],
    record_id: string,
  ): Promise<CreatePersonalDocumentsDto> {
    if (!files || files.length !== 4) {
      throw new BadRequestException('Debes subir exactamente 4 archivos');
    }

    const record = await this.recordRepository.findOne({
      where: { id: record_id },
    });

    if (!record) {
      throw new NotFoundException(`Record con ID ${record_id} no encontrado`);
    }

    const [pictureDoc, dniDoc, votingBallotDoc, notarizDegreeDoc] = files.map(
      (file) => file.filename,
    );

    return {
      record_id,
      pictureDoc,
      dniDoc,
      votingBallotDoc,
      notarizDegreeDoc,
    };
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

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException(
        'No se proporcionaron archivos para actualizar',
      );
    }

    return updates;
  }

  async savePersonalDocuments(
    createDto: CreatePersonalDocumentsDto,
  ): Promise<PersonalDocumentsEntity> {
    const record = await this.recordRepository.findOne({
      where: { id: createDto.record_id },
    });

    if (!record) {
      throw new NotFoundException(`Record con ID ${createDto.record_id} no encontrado`);
    }

    const documents = this.personalDocumentsRepository.create({
      ...createDto,
      record: record,
    });
    
    return this.personalDocumentsRepository.save(documents);
  }

  async updatePersonalDocuments(
    id: string,
    updateDto: UpdatePersonalDocumentsDto,
  ): Promise<PersonalDocumentsEntity> {
    const documents = await this.personalDocumentsRepository.findOne({
      where: { id },
    });
    if (!documents) {
      throw new NotFoundException(
        `Documentos personales con ID ${id} no encontrados`,
      );
    }

    Object.assign(documents, updateDto);
    return this.personalDocumentsRepository.save(documents);
  }

  async getAllPersonalDocuments(): Promise<PersonalDocumentsEntity[]> {
    return this.personalDocumentsRepository.find();
  }

  async getPersonalDocumentsById(id: string): Promise<PersonalDocumentsEntity> {
    const documents = await this.personalDocumentsRepository.findOne({
      where: { id },
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

    const filePath = path.join('./uploads/documentos-personales', filename);
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

   async getPersonalDocumentsByRecordId(recordId: string,): Promise<PersonalDocumentsEntity[]> {
      const record = await this.recordRepository.findOne({
        where: { id: recordId },
      });
  
      if (!record) {
        throw new NotFoundException(`Record con ID ${recordId} no encontrado`);
      }
  
      return this.personalDocumentsRepository.find({
        where: { record: { id: recordId } },
      });
    }
}
