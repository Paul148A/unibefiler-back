import { InscriptionDocumentsEntity } from "src/upload_files/entities/inscription-documents.entity";

export class InscriptionResponseDto {
  id: string;
  registrationDoc: string;
  registrationDocStatus?: { id: string; name: string };
  semesterGradeChartDoc: string;
  semesterGradeChartDocStatus?: { id: string; name: string };
  reEntryDoc: string;
  reEntryDocStatus?: { id: string; name: string };
  englishCertificateDoc: string;
  englishCertificateDocStatus?: { id: string; name: string };
  enrollmentCertificateDoc: string;
  enrollmentCertificateDocStatus?: { id: string; name: string };
  approvalDoc: string;
  approvalDocStatus?: { id: string; name: string };
  record?: {
    id: string;
    user?: {
      identification: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: InscriptionDocumentsEntity) {
    this.id = entity.id;
    this.registrationDoc = entity.registrationDoc;
    this.registrationDocStatus = entity.registrationDocStatus ? { id: entity.registrationDocStatus.id, name: entity.registrationDocStatus.name } : undefined;
    this.semesterGradeChartDoc = entity.semesterGradeChartDoc;
    this.semesterGradeChartDocStatus = entity.semesterGradeChartDocStatus ? { id: entity.semesterGradeChartDocStatus.id, name: entity.semesterGradeChartDocStatus.name } : undefined;
    this.reEntryDoc = entity.reEntryDoc;
    this.reEntryDocStatus = entity.reEntryDocStatus ? { id: entity.reEntryDocStatus.id, name: entity.reEntryDocStatus.name } : undefined;
    this.englishCertificateDoc = entity.englishCertificateDoc;
    this.englishCertificateDocStatus = entity.englishCertificateDocStatus ? { id: entity.englishCertificateDocStatus.id, name: entity.englishCertificateDocStatus.name } : undefined;
    this.enrollmentCertificateDoc = entity.enrollmentCertificateDoc;
    this.enrollmentCertificateDocStatus = entity.enrollmentCertificateDocStatus ? { id: entity.enrollmentCertificateDocStatus.id, name: entity.enrollmentCertificateDocStatus.name } : undefined;
    this.approvalDoc = entity.approvalDoc;
    this.approvalDocStatus = entity.approvalDocStatus ? { id: entity.approvalDocStatus.id, name: entity.approvalDocStatus.name } : undefined;
    this.record = entity.record ? {
      id: entity.record.id,
      user: entity.record.user ? {
        identification: entity.record.user.identification
      } : undefined
    } : undefined;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}