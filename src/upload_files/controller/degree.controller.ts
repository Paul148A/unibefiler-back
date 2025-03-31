import { Controller, Post, UploadedFiles, UseInterceptors, BadRequestException, Get, Put, Param, NotFoundException, Delete } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DegreeService } from '../services/degree.service';

@Controller('files')
export class UploadDegreeController {
  constructor(private readonly degreeService: DegreeService) {}


// AGREGAR
  @Post('upload-degree')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'topic_complain_doc', maxCount: 1 },
        { name: 'topic_approval_doc', maxCount: 1 },
        { name: 'tutor_assignment_doc', maxCount: 1 },
        { name: 'tutor_format_doc', maxCount: 1 },
        { name: 'antiplagiarism_doc', maxCount: 1 },
        { name: 'tutor_letter', maxCount: 1 },
        { name: 'elective_grade', maxCount: 1 },
        { name: 'academic_clearance', maxCount: 5 },
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
    ),
  )
  async uploadDegree(
    @UploadedFiles()
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
  ) {
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

    const topicComplainDoc = files.topic_complain_doc[0].filename;
    const topicApprovalDoc = files.topic_approval_doc[0].filename;
    const tutorAssignmentDoc = files.tutor_assignment_doc[0].filename;
    const tutorFormatDoc = files.tutor_format_doc[0].filename;
    const antiplagiarismDoc = files.antiplagiarism_doc[0].filename;
    const tutorLetter = files.tutor_letter[0].filename;
    const electiveGrade = files.elective_grade[0].filename;
    const academicClearance = files.academic_clearance[0].filename;

    await this.degreeService.saveDegree(
      topicComplainDoc,
      topicApprovalDoc,
      tutorAssignmentDoc,
      tutorFormatDoc,
      antiplagiarismDoc,
      tutorLetter,
      electiveGrade,
      academicClearance,
    );

    return { message: 'Documentos de grado subidos correctamente' };
  }

  // ACTUALIZAR
  @Put('update-degree/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'topic_complain_doc', maxCount: 1 },
        { name: 'topic_approval_doc', maxCount: 1 },
        { name: 'tutor_assignment_doc', maxCount: 1 },
        { name: 'tutor_format_doc', maxCount: 1 },
        { name: 'antiplagiarism_doc', maxCount: 1 },
        { name: 'tutor_letter', maxCount: 1 },
        { name: 'elective_grade', maxCount: 1 },
        { name: 'academic_clearance', maxCount: 5 },
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
    ),
  )
  async updateDegree(
    @Param('id') id: string,
    @UploadedFiles()
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
  ) {
    const degree = await this.degreeService.getDegreeById(id);
    if (!degree) {
      throw new NotFoundException('Grado no encontrado');
    }

    const updatedFiles = {
      topicComplainDoc: files.topic_complain_doc ? files.topic_complain_doc[0].filename : degree.topic_complain_doc,
      topicApprovalDoc: files.topic_approval_doc ? files.topic_approval_doc[0].filename : degree.topic_approval_doc,
      tutorAssignmentDoc: files.tutor_assignment_doc ? files.tutor_assignment_doc[0].filename : degree.tutor_assignment_doc,
      tutorFormatDoc: files.tutor_format_doc ? files.tutor_format_doc[0].filename : degree.tutor_format_doc,
      antiplagiarismDoc: files.antiplagiarism_doc ? files.antiplagiarism_doc[0].filename : degree.antiplagiarism_doc,
      tutorLetter: files.tutor_letter ? files.tutor_letter[0].filename : degree.tutor_letter,
      electiveGrade: files.elective_grade ? files.elective_grade[0].filename : degree.elective_grade,
      academicClearance: files.academic_clearance ? files.academic_clearance[0].filename : degree.academic_clearance,
    };

    await this.degreeService.updateDegree(id, updatedFiles);

    return { message: 'Documentos de grado actualizados correctamente' };
  }

  // OBTENER TODOS
  @Get('list-degrees')
  async listDegrees() {
    const degrees = await this.degreeService.getAllDegrees();
    return { message: 'Documentos de grado obtenidos correctamente', degrees };
  }

}