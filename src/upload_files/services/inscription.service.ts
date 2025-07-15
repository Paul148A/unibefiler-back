import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
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
import { DocumentStatusEntity } from '../../core/entities/document-status.entity';
import { CoreRepositoryEnum } from 'src/core/enums/core-repository-enum';
import { EmailService } from '../../auth/services/email.service';
import { UsersService } from '../../auth/services/user.service';

@Injectable()
export class InscriptionService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.INSCRIPTION_DOCUMENTS_REPOSITORY)
    private readonly inscriptionFormRepository: Repository<InscriptionDocumentsEntity>,
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
    @Inject(CoreRepositoryEnum.DOCUMENT_STATUS_REPOSITORY)
    private readonly documentStatusRepository: Repository<DocumentStatusEntity>,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
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

    // Buscar los estados si se proporcionan
    const registrationDocStatus = createDto.registrationDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.registrationDocStatus } }) : undefined;
    const semesterGradeChartDocStatus = createDto.semesterGradeChartDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.semesterGradeChartDocStatus } }) : undefined;
    const reEntryDocStatus = createDto.reEntryDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.reEntryDocStatus } }) : undefined;
    const englishCertificateDocStatus = createDto.englishCertificateDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.englishCertificateDocStatus } }) : undefined;
    const enrollmentCertificateDocStatus = createDto.enrollmentCertificateDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.enrollmentCertificateDocStatus } }) : undefined;
    const approvalDocStatus = createDto.approvalDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.approvalDocStatus } }) : undefined;

    const inscription = this.inscriptionFormRepository.create({
      ...createDto,
      record: record,
      registrationDocStatus,
      semesterGradeChartDocStatus,
      reEntryDocStatus,
      englishCertificateDocStatus,
      enrollmentCertificateDocStatus,
      approvalDocStatus,
    });
    
    return this.inscriptionFormRepository.save(inscription);
  }

  async updateInscriptionForm(
    id: string,
    updateDto: UpdateInscriptionDto,
  ): Promise<InscriptionDocumentsEntity> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id },
      relations: ['record', 'record.user'],
    });
    if (!inscription) {
      throw new NotFoundException(
        `Formulario de inscripción con ID ${id} no encontrado`,
      );
    }
    if (updateDto.registrationDocStatus) {
      inscription.registrationDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.registrationDocStatus } });
    }
    if (updateDto.semesterGradeChartDocStatus) {
      inscription.semesterGradeChartDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.semesterGradeChartDocStatus } });
    }
    if (updateDto.reEntryDocStatus) {
      inscription.reEntryDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.reEntryDocStatus } });
    }
    if (updateDto.englishCertificateDocStatus) {
      inscription.englishCertificateDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.englishCertificateDocStatus } });
    }
    if (updateDto.enrollmentCertificateDocStatus) {
      inscription.enrollmentCertificateDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.enrollmentCertificateDocStatus } });
    }
    if (updateDto.approvalDocStatus) {
      inscription.approvalDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.approvalDocStatus } });
    }
    Object.assign(inscription, updateDto);
    const updated = await this.inscriptionFormRepository.save(inscription);

    // Enviar correo si algún estado es 'rechazado'
    const statusFields = [
      'registrationDocStatus',
      'semesterGradeChartDocStatus',
      'reEntryDocStatus',
      'englishCertificateDocStatus',
      'enrollmentCertificateDocStatus',
      'approvalDocStatus',
    ];
    const documentTypeNames: Record<string, string> = {
      registrationDocStatus: 'Documento de registro',
      semesterGradeChartDocStatus: 'Documento de notas',
      reEntryDocStatus: 'Documento de reingreso',
      englishCertificateDocStatus: 'Certificado de inglés',
      enrollmentCertificateDocStatus: 'Certificado de matrícula',
      approvalDocStatus: 'Documento de aprobación',
    };
    for (const field of statusFields) {
      let status = inscription[field];
      if (status && typeof status === 'string') {
        const statusObj = await this.documentStatusRepository.findOne({ where: { id: status } });
        status = statusObj;
      }
      if (status && status.name && status.name.toLowerCase() === 'rechazado') {
        const user = inscription.record?.user;
        if (user && user.email) {
          const userName = `${user.names} ${user.last_names}`;
          const documentTypeFriendly = documentTypeNames[field] || field;
          const reason = 'Por favor, revise que la documentacion sea la correcta y vuelva a subirlo.';
          await this.emailService.sendRejectionEmail(user.email, userName, documentTypeFriendly, reason);
          // Eliminar archivo después de enviar el correo
          const docField = field.replace('Status', '');
          await this.deleteFileIfRejected(inscription, docField);
        }
      }
    }
    return updated;
  }

  async getAllInscriptionForms(): Promise<InscriptionDocumentsEntity[]> {
    return this.inscriptionFormRepository.find();
  }

  async getInscriptionFormById(id: string): Promise<InscriptionDocumentsEntity> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id },
      relations: [
        'registrationDocStatus',
        'semesterGradeChartDocStatus',
        'reEntryDocStatus',
        'englishCertificateDocStatus',
        'enrollmentCertificateDocStatus',
        'approvalDocStatus',
      ],
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

  async getInscriptionDocumentsByRecordId(recordId: string): Promise<InscriptionDocumentsEntity> {
    return this.inscriptionFormRepository.findOne({
      where: { record: { id: recordId } },
      relations: [
        'registrationDocStatus',
        'semesterGradeChartDocStatus',
        'reEntryDocStatus',
        'englishCertificateDocStatus',
        'enrollmentCertificateDocStatus',
        'approvalDocStatus',
      ],
    });
  }

  async updateCertificateStatus(id: string, updateStatusDto: any): Promise<InscriptionDocumentsEntity> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id },
      relations: [
        'registrationDocStatus',
        'semesterGradeChartDocStatus',
        'reEntryDocStatus',
        'englishCertificateDocStatus',
        'enrollmentCertificateDocStatus',
        'approvalDocStatus',
        'record',
        'record.user',
      ],
    });

    if (!inscription) {
      throw new NotFoundException(`Documento de inscripción con ID ${id} no encontrado`);
    }

    const validFields = [
      'registrationDocStatus',
      'semesterGradeChartDocStatus',
      'reEntryDocStatus',
      'englishCertificateDocStatus',
      'enrollmentCertificateDocStatus',
      'approvalDocStatus',
    ];
    if (!validFields.includes(updateStatusDto.field)) {
      throw new BadRequestException('Campo de estado inválido');
    }
    const statusEntity = await this.documentStatusRepository.findOne({ where: { id: updateStatusDto.statusId } });
    if (!statusEntity) {
      throw new NotFoundException('Estado no encontrado');
    }
    inscription[updateStatusDto.field] = statusEntity;
    await this.inscriptionFormRepository.save(inscription);

    // Lógica de envío de correo si el estado es rechazado
    let status = statusEntity;
    if (status && status.name && status.name.toLowerCase() === 'rechazado') {
      const user = inscription.record?.user;
      if (user && user.email) {
        const userName = `${user.names} ${user.last_names}`;
        const documentType = updateStatusDto.field;
        const reason = 'Su documento fue rechazado. Por favor, revise que la documentacion sea la correcta y vuelva a subirlo.';
        await this.emailService.sendRejectionEmail(user.email, userName, documentType, reason);
        // Eliminar archivo después de enviar el correo
        const docField = updateStatusDto.field.replace('Status', '');
        await this.deleteFileIfRejected(inscription, docField);
      }
    }
    return inscription;
  }

  async findById(id: string): Promise<InscriptionDocumentsEntity> {
    const inscription = await this.inscriptionFormRepository.findOne({
      where: { id },
      relations: ['record'],
    });

    if (!inscription) {
      throw new NotFoundException(`Sección de inscripción con ID ${id} no encontrado`);
    }

    return inscription;
  }

  async deleteFile(id: string, field: string): Promise<void> {
    const validFields = [
      'registrationDoc',
      'semesterGradeChartDoc',
      'reEntryDoc',
      'englishCertificateDoc',
      'enrollmentCertificateDoc',
      'approvalDoc',
    ];
    if (!validFields.includes(field)) {
      throw new BadRequestException('Campo de documento inválido');
    }
    const doc = await this.inscriptionFormRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    const filename = doc[field];
    if (filename) {
      const filePath = path.join('./uploads/documentos-inscripcion', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      doc[field] = null;
      await this.inscriptionFormRepository.save(doc);
    }
  }

  // Método privado para eliminar archivo si el estado es rechazado
  private async deleteFileIfRejected(inscription: InscriptionDocumentsEntity, field: string) {
    const filename = inscription[field];
    if (filename) {
      const filePath = path.join('./uploads/documentos-inscripcion', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      inscription[field] = null;
      await this.inscriptionFormRepository.save(inscription);
    }
  }
}