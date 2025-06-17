import { InscriptionDocumentsEntity } from "src/upload_files/entities/inscription-documents.entity";

export class InscriptionResponseDto {
  id: string;
  registrationDoc: string;
  semesterGradeChartDoc: string;
  reEntryDoc: string;
  englishCertificateDoc: string;
  enrollmentCertificateDoc: string;
  approvalDoc: string;
  englishCertificateStatus: 'approved' | 'rejected' | 'pending';

  constructor(entity: InscriptionDocumentsEntity) {
    this.id = entity.id;
    this.registrationDoc = entity.registrationDoc;
    this.semesterGradeChartDoc = entity.semesterGradeChartDoc;
    this.reEntryDoc = entity.reEntryDoc;
    this.englishCertificateDoc = entity.englishCertificateDoc;
    this.enrollmentCertificateDoc = entity.enrollmentCertificateDoc;
    this.approvalDoc = entity.approvalDoc;
    this.englishCertificateStatus = entity.englishCertificateStatus;
  }
}