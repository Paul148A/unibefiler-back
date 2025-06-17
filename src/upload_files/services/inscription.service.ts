import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';
import { InscriptionDocumentsEntity } from '../entities/inscription-documents.entity';
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
import { CreateInscriptionDto } from '../dto/inscription-document/create-inscription.dto';
import { UpdateInscriptionDto } from '../dto/inscription-document/update-inscription.dto';
import { RecordEntity } from '../entities/record.entity';
import { UpdateStatusDto } from '../dto/inscription-document/update-status.dto';

@Injectable()
export class InscriptionService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.INSCRIPTION_DOCUMENTS_REPOSITORY)
    private readonly inscriptionFormRepository: Repository<InscriptionDocumentsEntity>,
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
  ) {}

  static getFileUploadInterceptor() {
    return FileFieldsInterceptor(
      [
        { name: 'registration_doc', maxCount: 1 },
        { name: 'semester_grade_chart_doc', maxCount: 1 },
        { name: 're_entry_doc', maxCount: 1 },
        { name: 'english_certificate_doc', maxCount: 1 },
        { name: 'enrollment_certificate_doc', maxCount: 1 },
        { name: 'approval_doc', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/documentos-inscripcion',
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
    files: {
      registration_doc?: Express.Multer.File[];
      semester_grade_chart_doc?: Express.Multer.File[];
      re_entry_doc?: Express.Multer.File[];
      english_certificate_doc?: Express.Multer.File[];
      enrollment_certificate_doc?: Express.Multer.File[];
      approval_doc?: Express.Multer.File[];
    },
    record_id: string,
  ): Promise<CreateInscriptionDto> {
    if (
      !files.registration_doc ||
      !files.semester_grade_chart_doc ||
      !files.re_entry_doc ||
      !files.english_certificate_doc ||
      !files.enrollment_certificate_doc ||
      !files.approval_doc
    ) {
      throw new BadRequestException('Debes subir todos los archivos requeridos');
    }

    const record = await this.recordRepository.findOne({
      where: { id: record_id },
    });

    if (!record) {
      throw new NotFoundException(`Record con ID ${record_id} no encontrado`);
    }

    return {
      record_id,
      registrationDoc: files.registration_doc[0].filename,
      semesterGradeChartDoc: files.semester_grade_chart_doc[0].filename,
      reEntryDoc: files.re_entry_doc[0].filename,
      englishCertificateDoc: files.english_certificate_doc[0].filename,
      enrollmentCertificateDoc: files.enrollment_certificate_doc[0].filename,
      approvalDoc: files.approval_doc[0].filename,
    };
  }

  async processUploadedFilesForUpdate(files: {
    registration_doc?: Express.Multer.File[];
    semester_grade_chart_doc?: Express.Multer.File[];
    re_entry_doc?: Express.Multer.File[];
    english_certificate_doc?: Express.Multer.File[];
    enrollment_certificate_doc?: Express.Multer.File[];
    approval_doc?: Express.Multer.File[];
  }): Promise<UpdateInscriptionDto> {
    const updates: UpdateInscriptionDto = {};

    if (files.registration_doc?.[0]) updates.registrationDoc = files.registration_doc[0].filename;
    if (files.semester_grade_chart_doc?.[0]) updates.semesterGradeChartDoc = files.semester_grade_chart_doc[0].filename;
    if (files.re_entry_doc?.[0]) updates.reEntryDoc = files.re_entry_doc[0].filename;
    if (files.english_certificate_doc?.[0]) updates.englishCertificateDoc = files.english_certificate_doc[0].filename;
    if (files.enrollment_certificate_doc?.[0]) updates.enrollmentCertificateDoc = files.enrollment_certificate_doc[0].filename;
    if (files.approval_doc?.[0]) updates.approvalDoc = files.approval_doc[0].filename;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No se proporcionaron archivos para actualizar');
    }

    return updates;
  }

  async saveInscriptionForm(
    createDto: CreateInscriptionDto,
  ): Promise<InscriptionDocumentsEntity> {
    const record = await this.recordRepository.findOne({
      where: { id: createDto.record_id },
    });

    if (!record) {
      throw new NotFoundException(`Record con ID ${createDto.record_id} no encontrado`);
    }

    const inscription = this.inscriptionFormRepository.create({
      ...createDto,
      record: record,
    });
    
    return this.inscriptionFormRepository.save(inscription);
  }

  async updateInscriptionForm(
    id: string,
    updateDto: UpdateInscriptionDto,
  ): Promise<InscriptionDocumentsEntity> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id },
    });
    if (!inscription) {
      throw new NotFoundException(
        `Formulario de inscripción con ID ${id} no encontrado`,
      );
    }

    Object.assign(inscription, updateDto);
    return this.inscriptionFormRepository.save(inscription);
  }

  async getAllInscriptionForms(): Promise<InscriptionDocumentsEntity[]> {
    return this.inscriptionFormRepository.find();
  }

  async getInscriptionFormById(id: string): Promise<InscriptionDocumentsEntity> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id },
    });
    if (!inscription) {
      throw new NotFoundException(
        `Formulario de inscripción con ID ${id} no encontrado`,
      );
    }
    return inscription;
  }

  async deleteInscriptionForm(id: string): Promise<void> {
    const result = await this.inscriptionFormRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Formulario de inscripción con ID ${id} no encontrado`,
      );
    }
  }

  async downloadDocument(
    id: string,
    documentType: string,
    res: Response,
  ): Promise<void> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id },
    });
    if (!inscription) {
      throw new NotFoundException(
        `Formulario de inscripción con ID ${id} no encontrado`,
      );
    }

    const documentField = this.mapDocumentTypeToField(documentType);
    const filename = inscription[documentField];
    if (!filename) {
      throw new NotFoundException(`Documento ${documentType} no encontrado`);
    }

    const filePath = path.join('./uploads/documentos-inscripcion', filename);
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
      registration: 'registrationDoc',
      semester_grade_chart: 'semesterGradeChartDoc',
      re_entry: 'reEntryDoc',
      english_certificate: 'englishCertificateDoc',
      enrollment_certificate: 'enrollmentCertificateDoc',
      approval: 'approvalDoc',
    };

    if (!mapping[documentType]) {
      throw new NotFoundException(
        `Tipo de documento ${documentType} no válido`,
      );
    }

    return mapping[documentType];
  }

  async getInscriptionDocumentsByRecordId(recordId: string): Promise<InscriptionDocumentsEntity[]> {
    return this.inscriptionFormRepository.find({
      where: { record: { id: recordId } },
      relations: ['record']
    });
  }

  async updateCertificateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<InscriptionDocumentsEntity> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id }
    });

    if (!inscription) {
      throw new NotFoundException(`Documento de inscripción con ID ${id} no encontrado`);
    }

    inscription.englishCertificateStatus = updateStatusDto.status;
    return this.inscriptionFormRepository.save(inscription);
  }
}