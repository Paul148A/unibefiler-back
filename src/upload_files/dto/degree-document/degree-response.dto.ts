import { DegreeDocumentsEntity } from "../../entities/degree-documents.entity";

export class DegreeResponseDto {
  id: string;
  topicComplainDoc: string;
  topicComplainDocStatus?: { id: string; name: string };
  topicApprovalDoc: string;
  topicApprovalDocStatus?: { id: string; name: string };
  tutorAssignmentDoc: string;
  tutorAssignmentDocStatus?: { id: string; name: string };
  tutorFormatDoc: string;
  tutorFormatDocStatus?: { id: string; name: string };
  antiplagiarismDoc: string;
  antiplagiarismDocStatus?: { id: string; name: string };
  tutorLetter: string;
  tutorLetterStatus?: { id: string; name: string };
  electiveGrade: string;
  electiveGradeStatus?: { id: string; name: string };
  academicClearance: string;
  academicClearanceStatus?: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DegreeDocumentsEntity) {
    this.id = entity.id;
    this.topicComplainDoc = entity.topicComplainDoc;
    this.topicComplainDocStatus = entity.topicComplainDocStatus ? { id: entity.topicComplainDocStatus.id, name: entity.topicComplainDocStatus.name } : undefined;
    this.topicApprovalDoc = entity.topicApprovalDoc;
    this.topicApprovalDocStatus = entity.topicApprovalDocStatus ? { id: entity.topicApprovalDocStatus.id, name: entity.topicApprovalDocStatus.name } : undefined;
    this.tutorAssignmentDoc = entity.tutorAssignmentDoc;
    this.tutorAssignmentDocStatus = entity.tutorAssignmentDocStatus ? { id: entity.tutorAssignmentDocStatus.id, name: entity.tutorAssignmentDocStatus.name } : undefined;
    this.tutorFormatDoc = entity.tutorFormatDoc;
    this.tutorFormatDocStatus = entity.tutorFormatDocStatus ? { id: entity.tutorFormatDocStatus.id, name: entity.tutorFormatDocStatus.name } : undefined;
    this.antiplagiarismDoc = entity.antiplagiarismDoc;
    this.antiplagiarismDocStatus = entity.antiplagiarismDocStatus ? { id: entity.antiplagiarismDocStatus.id, name: entity.antiplagiarismDocStatus.name } : undefined;
    this.tutorLetter = entity.tutorLetter;
    this.tutorLetterStatus = entity.tutorLetterStatus ? { id: entity.tutorLetterStatus.id, name: entity.tutorLetterStatus.name } : undefined;
    this.electiveGrade = entity.electiveGrade;
    this.electiveGradeStatus = entity.electiveGradeStatus ? { id: entity.electiveGradeStatus.id, name: entity.electiveGradeStatus.name } : undefined;
    this.academicClearance = entity.academicClearance;
    this.academicClearanceStatus = entity.academicClearanceStatus ? { id: entity.academicClearanceStatus.id, name: entity.academicClearanceStatus.name } : undefined;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}