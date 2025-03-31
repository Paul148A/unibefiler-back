import { Controller, Post, UploadedFiles, UseInterceptors, BadRequestException, Get, Put, Param, NotFoundException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InscriptionFormService } from '../services/inscription-form.service';

@Controller('files')
export class UploadInscriptionFormController {
  constructor(private readonly inscriptionFormService: InscriptionFormService) {}

  @Post('upload-inscription-form')
  @UseInterceptors(
    FileFieldsInterceptor(
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
    ),
  )
  async uploadInscriptionForm(
    @UploadedFiles()
    files: {
      registration_doc?: Express.Multer.File[];
      semester_grade_chart_doc?: Express.Multer.File[];
      re_entry_doc?: Express.Multer.File[];
      english_certificate_doc?: Express.Multer.File[];
      enrollment_certificate_doc?: Express.Multer.File[];
      approval_doc?: Express.Multer.File[];
    },
  ) {
    if (!files) {
      throw new BadRequestException('No se han proporcionado archivos');
    }
  
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
  
    try {
      const registrationDoc = files.registration_doc[0].filename;
      const semesterGradeChartDoc = files.semester_grade_chart_doc[0].filename;
      const reEntryDoc = files.re_entry_doc[0].filename;
      const englishCertificateDoc = files.english_certificate_doc[0].filename;
      const enrollmentCertificateDoc = files.enrollment_certificate_doc[0].filename;
      const approvalDoc = files.approval_doc[0].filename;
  
      await this.inscriptionFormService.saveInscriptionForm(
        registrationDoc,
        semesterGradeChartDoc,
        reEntryDoc,
        englishCertificateDoc,
        enrollmentCertificateDoc,
        approvalDoc
      );
  
      return { message: 'Formulario de inscripción subido correctamente' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('update-inscription-form/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
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
    ),
  )
  async updateInscriptionForm(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      registration_doc?: Express.Multer.File[];
      semester_grade_chart_doc?: Express.Multer.File[];
      re_entry_doc?: Express.Multer.File[];
      english_certificate_doc?: Express.Multer.File[];
      enrollment_certificate_doc?: Express.Multer.File[];
      approval_doc?: Express.Multer.File[];
    },
  ) {
    if (!files) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    if (
      !files.registration_doc &&
      !files.semester_grade_chart_doc &&
      !files.re_entry_doc &&
      !files.english_certificate_doc &&
      !files.enrollment_certificate_doc &&
      !files.approval_doc
    ) {
      throw new BadRequestException('Debes subir al menos un archivo');
    }

    const updatedFiles = {
      registrationDoc: files.registration_doc ? files.registration_doc[0].filename : undefined,
      semesterGradeChartDoc: files.semester_grade_chart_doc ? files.semester_grade_chart_doc[0].filename : undefined,
      reEntryDoc: files.re_entry_doc ? files.re_entry_doc[0].filename : undefined,
      englishCertificateDoc: files.english_certificate_doc ? files.english_certificate_doc[0].filename : undefined,
      enrollmentCertificateDoc: files.enrollment_certificate_doc ? files.enrollment_certificate_doc[0].filename : undefined,
      approvalDoc: files.approval_doc ? files.approval_doc[0].filename : undefined,
    };

    const updatedInscriptionForm = await this.inscriptionFormService.updateInscriptionForm(id, updatedFiles);
    return { message: 'Formulario de inscripción actualizado correctamente', inscriptionForm: updatedInscriptionForm };
  }

  @Get('list-inscription-forms')
  async listInscriptionForms() {
    const inscriptionForms = await this.inscriptionFormService.getAllInscriptionForms();
    return { message: 'Formularios de inscripción obtenidos correctamente', inscriptionForms };
  }
  
  
}
