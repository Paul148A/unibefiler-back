import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InscriptionDocumentsEntity } from '../entities/inscription-documents.entity';

@Injectable()
export class InscriptionFormService {
  constructor(
    @InjectRepository(InscriptionDocumentsEntity)
    private readonly inscriptionFormRepository: Repository<InscriptionDocumentsEntity>,
  ) {}

  async saveInscriptionForm(
    registrationDoc: string,
    semesterGradeChartDoc: string,
    reEntryDoc: string,
    englishCertificateDoc: string,
    enrollmentCertificateDoc: string,
    approvalDoc: string,
  ): Promise<InscriptionDocumentsEntity> {
    const inscriptionForm = new InscriptionDocumentsEntity();
    inscriptionForm.registrationDoc = registrationDoc;
    inscriptionForm.semesterGradeChartDoc = semesterGradeChartDoc;
    inscriptionForm.reEntryDoc = reEntryDoc;
    inscriptionForm.englishCertificateDoc = englishCertificateDoc;
    inscriptionForm.enrollmentCertificateDoc = enrollmentCertificateDoc;
    inscriptionForm.approvalDoc = approvalDoc;
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
  ): Promise<InscriptionDocumentsEntity> {
    const inscriptionForm = await this.inscriptionFormRepository.findOne({ where: { id } });
    if (!inscriptionForm) {
      throw new NotFoundException(`Formulario de inscripción con ID ${id} no encontrado`);
    }
  
    if (updatedFiles.registrationDoc !== undefined) {
      inscriptionForm.registrationDoc = updatedFiles.registrationDoc;
    }
    if (updatedFiles.semesterGradeChartDoc !== undefined) {
      inscriptionForm.semesterGradeChartDoc = updatedFiles.semesterGradeChartDoc;
    }
    if (updatedFiles.reEntryDoc !== undefined) {
      inscriptionForm.reEntryDoc = updatedFiles.reEntryDoc;
    }
    if (updatedFiles.englishCertificateDoc !== undefined) {
      inscriptionForm.englishCertificateDoc = updatedFiles.englishCertificateDoc;
    }
    if (updatedFiles.enrollmentCertificateDoc !== undefined) {
      inscriptionForm.enrollmentCertificateDoc = updatedFiles.enrollmentCertificateDoc;
    }
    if (updatedFiles.approvalDoc !== undefined) {
      inscriptionForm.approvalDoc = updatedFiles.approvalDoc;
    }
  
    return this.inscriptionFormRepository.save(inscriptionForm);
  }

  async getAllInscriptionForms(): Promise<InscriptionDocumentsEntity[]> {
    return this.inscriptionFormRepository.find();
  }

}