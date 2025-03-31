import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InscriptionForm } from '../entities/inscription-form.entity';

@Injectable()
export class InscriptionFormService {
  constructor(
    @InjectRepository(InscriptionForm)
    private readonly inscriptionFormRepository: Repository<InscriptionForm>,
  ) {}

  async saveInscriptionForm(
    registrationDoc: string,
    semesterGradeChartDoc: string,
    reEntryDoc: string,
    englishCertificateDoc: string,
    enrollmentCertificateDoc: string,
    approvalDoc: string,
  ): Promise<InscriptionForm> {
    const inscriptionForm = new InscriptionForm();
    inscriptionForm.registration_doc = registrationDoc;
    inscriptionForm.semester_grade_chart_doc = semesterGradeChartDoc;
    inscriptionForm.re_entry_doc = reEntryDoc;
    inscriptionForm.english_certificate_doc = englishCertificateDoc;
    inscriptionForm.enrollment_certificate_doc = enrollmentCertificateDoc;
    inscriptionForm.approval_doc = approvalDoc;
    return this.inscriptionFormRepository.save(inscriptionForm);
  }

  async updateInscriptionForm(
    id: string,
    updatedFiles: {
      registrationDoc?: string;
      semesterGradeChartDoc?: string;
      reEntryDoc?: string;
      englishCertificateDoc?: string;
      enrollmentCertificateDoc?: string;
      approvalDoc?: string;
    },
  ): Promise<InscriptionForm> {
    const inscriptionForm = await this.inscriptionFormRepository.findOne({ where: { id } });
    if (!inscriptionForm) {
      throw new NotFoundException(`Formulario de inscripción con ID ${id} no encontrado`);
    }
  
    if (updatedFiles.registrationDoc !== undefined) {
      inscriptionForm.registration_doc = updatedFiles.registrationDoc;
    }
    if (updatedFiles.semesterGradeChartDoc !== undefined) {
      inscriptionForm.semester_grade_chart_doc = updatedFiles.semesterGradeChartDoc;
    }
    if (updatedFiles.reEntryDoc !== undefined) {
      inscriptionForm.re_entry_doc = updatedFiles.reEntryDoc;
    }
    if (updatedFiles.englishCertificateDoc !== undefined) {
      inscriptionForm.english_certificate_doc = updatedFiles.englishCertificateDoc;
    }
    if (updatedFiles.enrollmentCertificateDoc !== undefined) {
      inscriptionForm.enrollment_certificate_doc = updatedFiles.enrollmentCertificateDoc;
    }
    if (updatedFiles.approvalDoc !== undefined) {
      inscriptionForm.approval_doc = updatedFiles.approvalDoc;
    }
  
    return this.inscriptionFormRepository.save(inscriptionForm);
  }

  async getAllInscriptionForms(): Promise<InscriptionForm[]> {
    return this.inscriptionFormRepository.find();
  }

}