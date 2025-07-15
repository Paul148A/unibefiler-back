import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';
import { DegreeDocumentsEntity } from '../entities/degree-documents.entity';
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
import { CreateDegreeDto } from '../dto/degree-document/create-degree.dto';
import { UpdateDegreeDto } from '../dto/degree-document/update-degree.dto';
import { RecordEntity } from '../entities/record.entity';
import { DocumentStatusEntity } from '../../core/entities/document-status.entity';
import { CoreRepositoryEnum } from 'src/core/enums/core-repository-enum';
import { UpdateDegreeStatusDto } from '../dto/degree-document/update-degree.dto';
import { EmailService } from '../../auth/services/email.service';
import { UsersService } from '../../auth/services/user.service';

@Injectable()
export class DegreeService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.DEGREE_DOCUMENTS_REPOSITORY)
    private readonly degreeRepository: Repository<DegreeDocumentsEntity>,
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
        { name: 'topic_complain_doc', maxCount: 1 },
        { name: 'topic_approval_doc', maxCount: 1 },
        { name: 'tutor_assignment_doc', maxCount: 1 },
        { name: 'tutor_format_doc', maxCount: 1 },
        { name: 'antiplagiarism_doc', maxCount: 1 },
        { name: 'tutor_letter', maxCount: 1 },
        { name: 'elective_grade', maxCount: 1 },
        { name: 'academic_clearance', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/documentos-grado',
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

  async processUploadedFiles(
    files: {
      topic_complain_doc?: Express.Multer.File[];
      topic_approval_doc?: Express.Multer.File[];
      tutor_assignment_doc?: Express.Multer.File[];
      tutor_format_doc?: Express.Multer.File[];
      antiplagiarism_doc?: Express.Multer.File[];
      tutor_letter?: Express.Multer.File[];
      elective_grade?: Express.Multer.File[];
      academic_clearance?: Express.Multer.File[];
    },
    record_id: string,
  ): Promise<CreateDegreeDto> {
    if (
      !files.topic_complain_doc ||
      !files.topic_approval_doc ||
      !files.tutor_assignment_doc ||
      !files.tutor_format_doc ||
      !files.antiplagiarism_doc ||
      !files.tutor_letter ||
      !files.elective_grade ||
      !files.academic_clearance
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
      topicComplainDoc: files.topic_complain_doc[0].filename,
      topicApprovalDoc: files.topic_approval_doc[0].filename,
      tutorAssignmentDoc: files.tutor_assignment_doc[0].filename,
      tutorFormatDoc: files.tutor_format_doc[0].filename,
      antiplagiarismDoc: files.antiplagiarism_doc[0].filename,
      tutorLetter: files.tutor_letter[0].filename,
      electiveGrade: files.elective_grade[0].filename,
      academicClearance: files.academic_clearance[0].filename,
    };
  }

  async processUploadedFilesForUpdate(files: {
    topic_complain_doc?: Express.Multer.File[];
    topic_approval_doc?: Express.Multer.File[];
    tutor_assignment_doc?: Express.Multer.File[];
    tutor_format_doc?: Express.Multer.File[];
    antiplagiarism_doc?: Express.Multer.File[];
    tutor_letter?: Express.Multer.File[];
    elective_grade?: Express.Multer.File[];
    academic_clearance?: Express.Multer.File[];
  }): Promise<UpdateDegreeDto> {
    const updates: UpdateDegreeDto = {};

    if (files.topic_complain_doc?.[0]) updates.topicComplainDoc = files.topic_complain_doc[0].filename;
    if (files.topic_approval_doc?.[0]) updates.topicApprovalDoc = files.topic_approval_doc[0].filename;
    if (files.tutor_assignment_doc?.[0]) updates.tutorAssignmentDoc = files.tutor_assignment_doc[0].filename;
    if (files.tutor_format_doc?.[0]) updates.tutorFormatDoc = files.tutor_format_doc[0].filename;
    if (files.antiplagiarism_doc?.[0]) updates.antiplagiarismDoc = files.antiplagiarism_doc[0].filename;
    if (files.tutor_letter?.[0]) updates.tutorLetter = files.tutor_letter[0].filename;
    if (files.elective_grade?.[0]) updates.electiveGrade = files.elective_grade[0].filename;
    if (files.academic_clearance?.[0]) updates.academicClearance = files.academic_clearance[0].filename;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No se proporcionaron archivos para actualizar');
    }

    return updates;
  }

  async saveDegree(
    createDto: CreateDegreeDto,
  ): Promise<DegreeDocumentsEntity> {
    const record = await this.recordRepository.findOne({
      where: { id: createDto.record_id },
    });

    if (!record) {
      throw new NotFoundException(`Record con ID ${createDto.record_id} no encontrado`);
    }
    // Buscar los estados si se proporcionan
    const topicComplainDocStatus = createDto.topicComplainDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.topicComplainDocStatus } }) : undefined;
    const topicApprovalDocStatus = createDto.topicApprovalDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.topicApprovalDocStatus } }) : undefined;
    const tutorAssignmentDocStatus = createDto.tutorAssignmentDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.tutorAssignmentDocStatus } }) : undefined;
    const tutorFormatDocStatus = createDto.tutorFormatDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.tutorFormatDocStatus } }) : undefined;
    const antiplagiarismDocStatus = createDto.antiplagiarismDocStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.antiplagiarismDocStatus } }) : undefined;
    const tutorLetterStatus = createDto.tutorLetterStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.tutorLetterStatus } }) : undefined;
    const electiveGradeStatus = createDto.electiveGradeStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.electiveGradeStatus } }) : undefined;
    const academicClearanceStatus = createDto.academicClearanceStatus ? await this.documentStatusRepository.findOne({ where: { id: createDto.academicClearanceStatus } }) : undefined;
    const degree = this.degreeRepository.create({
      ...createDto,
      record: record,
      topicComplainDocStatus,
      topicApprovalDocStatus,
      tutorAssignmentDocStatus,
      tutorFormatDocStatus,
      antiplagiarismDocStatus,
      tutorLetterStatus,
      electiveGradeStatus,
      academicClearanceStatus,
    });
    
    return this.degreeRepository.save(degree);
  }

  async updateDegreeForm(
    id: string,
    updateDto: UpdateDegreeDto,
  ): Promise<DegreeDocumentsEntity> {
    const degree = await this.degreeRepository.findOne({
      where: { id },
    });
    if (!degree) {
      throw new NotFoundException(
        `Documentos de grado con ID ${id} no encontrados`,
      );
    }

    if (updateDto.topicComplainDocStatus) {
      degree.topicComplainDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.topicComplainDocStatus } });
    }
    if (updateDto.topicApprovalDocStatus) {
      degree.topicApprovalDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.topicApprovalDocStatus } });
    }
    if (updateDto.tutorAssignmentDocStatus) {
      degree.tutorAssignmentDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.tutorAssignmentDocStatus } });
    }
    if (updateDto.tutorFormatDocStatus) {
      degree.tutorFormatDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.tutorFormatDocStatus } });
    }
    if (updateDto.antiplagiarismDocStatus) {
      degree.antiplagiarismDocStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.antiplagiarismDocStatus } });
    }
    if (updateDto.tutorLetterStatus) {
      degree.tutorLetterStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.tutorLetterStatus } });
    }
    if (updateDto.electiveGradeStatus) {
      degree.electiveGradeStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.electiveGradeStatus } });
    }
    if (updateDto.academicClearanceStatus) {
      degree.academicClearanceStatus = await this.documentStatusRepository.findOne({ where: { id: updateDto.academicClearanceStatus } });
    }
    Object.assign(degree, updateDto);
    return this.degreeRepository.save(degree);
  }

  async updateDegreeStatus(id: string, dto: UpdateDegreeStatusDto): Promise<DegreeDocumentsEntity> {
    const degree = await this.degreeRepository.findOne({ where: { id }, relations: ['record', 'record.user'] });
    if (!degree) throw new NotFoundException('Documento de grado no encontrado');
    const validFields = [
      'topicComplainDocStatus',
      'topicApprovalDocStatus',
      'tutorAssignmentDocStatus',
      'tutorFormatDocStatus',
      'antiplagiarismDocStatus',
      'tutorLetterStatus',
      'electiveGradeStatus',
      'academicClearanceStatus',
    ];
    if (!validFields.includes(dto.field)) {
      throw new BadRequestException('Campo de estado inválido');
    }
    degree[dto.field] = dto.statusId;
    await this.degreeRepository.save(degree);

    // Enviar correo si algún estado es 'rechazado'
    const documentTypeNames: Record<string, string> = {
      topicComplainDocStatus: 'Solicitud de tema de tesis',
      topicApprovalDocStatus: 'Aprobación de tema de tesis',
      tutorAssignmentDocStatus: 'Asignación de tutor',
      tutorFormatDocStatus: 'Formato de tutoría',
      antiplagiarismDocStatus: 'Documento de antiplagio',
      tutorLetterStatus: 'Carta de tutor',
      electiveGradeStatus: 'Nota de grado electivo',
      academicClearanceStatus: 'Documento de libre de deuda',
    };
    const status = degree[dto.field];
    let statusObj = status;
    if (status && typeof status === 'string') {
      statusObj = await this.documentStatusRepository.findOne({ where: { id: status } });
    }
    if (statusObj && statusObj.name && statusObj.name.toLowerCase() === 'rechazado') {
      const user = degree.record?.user;
      if (user && user.email) {
        const userName = `${user.names} ${user.last_names}`;
        const documentTypeFriendly = documentTypeNames[dto.field] || dto.field;
        const reason = 'Por favor, revise que la documentacion sea la correcta y vuelva a subirlo.';
        await this.emailService.sendRejectionEmail(user.email, userName, documentTypeFriendly, reason);
        // Eliminar archivo después de enviar el correo
        const docField = dto.field.replace('Status', '');
        await this.deleteFileIfRejected(degree, docField);
      }
    }
    return degree;
  }

  async getDegreeById(id: string): Promise<DegreeDocumentsEntity> {
    const degree = await this.degreeRepository.findOne({
      where: { id },
      relations: [
        'topicComplainDocStatus',
        'topicApprovalDocStatus',
        'tutorAssignmentDocStatus',
        'tutorFormatDocStatus',
        'antiplagiarismDocStatus',
        'tutorLetterStatus',
        'electiveGradeStatus',
        'academicClearanceStatus',
      ],
    });
    if (!degree) {
      throw new NotFoundException(
        `Documentos de grado con ID ${id} no encontrados`,
      );
    }
    return degree;
  }

  async deleteDegree(id: string): Promise<void> {
    const result = await this.degreeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Documentos de grado con ID ${id} no encontrados`,
      );
    }
  }

  async downloadDocument(
    id: string,
    documentType: string,
    res: Response,
  ): Promise<void> {
    const degree = await this.degreeRepository.findOne({
      where: { id },
    });
    if (!degree) {
      throw new NotFoundException(
        `Documentos de grado con ID ${id} no encontrados`,
      );
    }

    const documentField = this.mapDocumentTypeToField(documentType);
    const filename = degree[documentField];
    if (!filename) {
      throw new NotFoundException(`Documento ${documentType} no encontrado`);
    }

    const filePath = path.join('./uploads/documentos-grado', filename);
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
      topic_complain: 'topicComplainDoc',
      topic_approval: 'topicApprovalDoc',
      tutor_assignment: 'tutorAssignmentDoc',
      tutor_format: 'tutorFormatDoc',
      antiplagiarism: 'antiplagiarismDoc',
      tutor_letter: 'tutorLetter',
      elective_grade: 'electiveGrade',
      academic_clearance: 'academicClearance',
    };
    if (!mapping[documentType]) {
      throw new NotFoundException(
        `Tipo de documento ${documentType} no válido`,
      );
    }

    return mapping[documentType];
  }

  async getDegreeDocumentsByRecordId(recordId: string): Promise<DegreeDocumentsEntity | null> {
    return this.degreeRepository.findOne({
      where: { record: { id: recordId } },
      relations: [
        'topicComplainDocStatus',
        'topicApprovalDocStatus',
        'tutorAssignmentDocStatus',
        'tutorFormatDocStatus',
        'antiplagiarismDocStatus',
        'tutorLetterStatus',
        'electiveGradeStatus',
        'academicClearanceStatus',
      ],
    });
  }

  async deleteFile(id: string, field: string): Promise<void> {
    const validFields = [
      'topicComplainDoc',
      'topicApprovalDoc',
      'tutorAssignmentDoc',
      'tutorFormatDoc',
      'antiplagiarismDoc',
      'tutorLetter',
      'electiveGrade',
      'academicClearance',
    ];
    if (!validFields.includes(field)) {
      throw new BadRequestException('Campo de documento inválido');
    }
    const doc = await this.degreeRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    const filename = doc[field];
    if (filename) {
      const filePath = path.join('./uploads/documentos-grado', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      doc[field] = null;
      await this.degreeRepository.save(doc);
    }
  }

  // Método privado para eliminar archivo si el estado es rechazado
  private async deleteFileIfRejected(degree: DegreeDocumentsEntity, field: string) {
    const filename = degree[field];
    if (filename) {
      const filePath = path.join('./uploads/documentos-grado', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      degree[field] = null;
      await this.degreeRepository.save(degree);
    }
  }
}