import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { DegreeDocumentsEntity } from '../entities/degree-documents.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateDegreeDto } from '../dto/degree-document/create-degree.dto';
import { DegreeResponseDto } from '../dto/degree-document/degree-response.dto';
import { UpdateDegreeDto } from '../dto/degree-document/update-degree.dto';

@Injectable()
export class DegreeService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.DEGREE_DOCUMENTS_REPOSITORY)
    private readonly degreeRepository: Repository<DegreeDocumentsEntity>,
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
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
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

  async processUploadedFiles(files: {
    topic_complain_doc?: Express.Multer.File[];
    topic_approval_doc?: Express.Multer.File[];
    tutor_assignment_doc?: Express.Multer.File[];
    tutor_format_doc?: Express.Multer.File[];
    antiplagiarism_doc?: Express.Multer.File[];
    tutor_letter?: Express.Multer.File[];
    elective_grade?: Express.Multer.File[];
    academic_clearance?: Express.Multer.File[];
  }): Promise<CreateDegreeDto> {
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
      throw new BadRequestException(
        'Debes subir todos los archivos requeridos',
      );
    }

    return {
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

  async saveDegree(
    createDegreeDto: CreateDegreeDto,
  ): Promise<DegreeResponseDto> {
    const degree = this.degreeRepository.create(createDegreeDto);
    const savedDegree = await this.degreeRepository.save(degree);
    return new DegreeResponseDto(savedDegree);
  }

  async getAllDegrees(): Promise<DegreeResponseDto[]> {
    const degrees = await this.degreeRepository.find();
    return degrees.map((degree) => new DegreeResponseDto(degree));
  }

  async updateDegree(
    id: string,
    updateDegreeDto: UpdateDegreeDto,
  ): Promise<DegreeResponseDto> {
    const degree = await this.degreeRepository.findOne({ where: { id } });
    if (!degree) {
      throw new NotFoundException(`Grado con ID ${id} no encontrado`);
    }

    Object.assign(degree, updateDegreeDto);
    const updatedDegree = await this.degreeRepository.save(degree);
    return new DegreeResponseDto(updatedDegree);
  }

  async getDegreeById(id: string): Promise<DegreeResponseDto> {
    const degree = await this.degreeRepository.findOne({ where: { id } });
    if (!degree) {
      throw new NotFoundException(`Grado con ID ${id} no encontrado`);
    }
    return new DegreeResponseDto(degree);
  }

  async deleteDegree(id: string): Promise<void> {
    const result = await this.degreeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Documento de grado con ID ${id} no encontrado`,
      );
    }
  }

  async downloadDocument(
    id: string,
    documentType: string,
    res: Response,
  ): Promise<void> {
    const degree = await this.degreeRepository.findOne({ where: { id } });
    if (!degree) {
      throw new NotFoundException(`Grado con ID ${id} no encontrado`);
    }

    const documentField = this.mapDocumentTypeToField(documentType);
    const filename = degree[documentField];
    if (!filename) {
      throw new NotFoundException(
        `Documento ${documentType} no encontrado para este grado`,
      );
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
}
