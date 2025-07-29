import { SemesterService } from './../../core/services/semester.service';
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UploadFilesRepositoryEnum } from "../enums/upload-files-repository.enum";
import { Repository } from "typeorm";
import { GradeEntity } from "../entities/grade.entity";
import { CreateGradeDto } from "../dto/grade/create-grade.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { InscriptionService } from "./inscription.service";
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GradeService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.GRADE_REPOSITORY)
    private readonly gradeRepository: Repository<GradeEntity>,
    private readonly inscriptionDocumentsService: InscriptionService,
    private readonly semesterService: SemesterService,
  ) { }

  static getFileUploadInterceptor() {
    return FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documentos-notas',
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

  async Create(data: CreateGradeDto): Promise<GradeEntity> {
    if (!data.name) {
      throw new BadRequestException('Debes subir un archivo');
    }

    const inscriptionDocument = await this.inscriptionDocumentsService.findById(data.inscriptionDocumentId);

    const semester = await this.semesterService.findById(data.semesterId);

    if (!semester) {
      throw new NotFoundException(`Semestre con ID ${data.semesterId} no encontrado`);
    }

    if (!inscriptionDocument) {
      throw new NotFoundException(`Seccion documentos de inscripción con ID ${data.inscriptionDocumentId} no encontrado`);
    }

    const grade = this.gradeRepository.create({
      ...data,
      inscriptionDocument,
      semester,
    });

    return this.gradeRepository.save(grade);
  }

  async createGradeEnrollment(createGradeEnrollmentDto: CreateGradeDto): Promise<GradeEntity> {
    const gradeEnrollment = this.gradeRepository.create(createGradeEnrollmentDto);
    return this.gradeRepository.save(gradeEnrollment);
  }

  async findGradesByInscriptionDocumentsId(inscriptionDocumentId: string): Promise<GradeEntity[]> {
    const grades = await this.gradeRepository.find({
      where: { inscriptionDocument: { id: inscriptionDocumentId } },
      relations: ['inscriptionDocument', 'semester'],
    });

    return grades || [];
  }

  async downloadDocument(
    id: string,
    res: Response,
  ): Promise<void> {
    const grade = await this.gradeRepository.findOne({
      where: { id },
    });
    
    if (!grade) {
      throw new NotFoundException(
        `Documento de notas con ID ${id} no encontrado`,
      );
    }

    const filename = grade.name;
    
    if (!filename) {
      throw new NotFoundException(`Documento no encontrado`);
    }

    const filePath = path.join('./uploads/documentos-notas', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(
        `Archivo ${filename} no encontrado en el servidor`,
      );
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    fs.createReadStream(filePath).pipe(res);
  }
}