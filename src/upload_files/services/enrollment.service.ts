import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UploadFilesRepositoryEnum } from "../enums/upload-files-repository.enum";
import { Repository } from "typeorm";
import { EnrollmentEntity } from "../entities/enrollment.entity";
import { CreateEnrollmentDto } from "../dto/enrollment/create-enrollment.dto";
import { InscriptionService } from "./inscription.service";
import { SemesterService } from "src/core/services/semester.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Injectable()
export class EnrollmentService {
    constructor(
        @Inject(UploadFilesRepositoryEnum.ENROLLMENT_DOC_REPOSITORY)
        private readonly enrollmentRepository: Repository<EnrollmentEntity>,
        private readonly inscriptionDocumentsService: InscriptionService,
        private readonly semesterService: SemesterService,
    ) { }
    static getFileUploadInterceptor() {
        return FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/documentos-matriculas',
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
    async findById(id: string): Promise<EnrollmentEntity> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: ['inscriptionDocument'],
        });

        if (!enrollment) {
            throw new NotFoundException(`Documento de inscripción con ID ${id} no encontrada`);
        }

        return enrollment;
    }

    async Create(data: CreateEnrollmentDto): Promise<EnrollmentEntity> {
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

        const grade = this.enrollmentRepository.create({
            ...data,
            inscriptionDocument,
            semester,
        });

        return this.enrollmentRepository.save(grade);
    }

    async findEnrollmentsByInscriptionDocumentsId(inscriptionDocumentId: string): Promise<EnrollmentEntity[]> {
        const enrollments = await this.enrollmentRepository.find({
            where: { inscriptionDocument: { id: inscriptionDocumentId } },
            relations: ['inscriptionDocument', 'semester'],
        });

        if (!enrollments || enrollments.length === 0) {
            throw new NotFoundException(`No se encontraron documentos de inscripción para el ID ${inscriptionDocumentId}`);
        }

        return enrollments;
    }
}