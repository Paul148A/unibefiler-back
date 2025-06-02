import { DegreeDocumentsEntity } from "src/upload_files/entities/degree-documents.entity";

export class DegreeResponseDto {
  id: string;
  topicComplainDoc: string;
  topicApprovalDoc: string;
  tutorAssignmentDoc: string;
  tutorFormatDoc: string;
  antiplagiarismDoc: string;
  tutorLetter: string;
  electiveGrade: string;
  academicClearance: string;

  constructor(entity: DegreeDocumentsEntity) {
    this.id = entity.id;
    this.topicComplainDoc = entity.topicComplainDoc;
    this.topicApprovalDoc = entity.topicApprovalDoc;
    this.tutorAssignmentDoc = entity.tutorAssignmentDoc;
    this.tutorFormatDoc = entity.tutorFormatDoc;
    this.antiplagiarismDoc = entity.antiplagiarismDoc;
    this.tutorLetter = entity.tutorLetter;
    this.electiveGrade = entity.electiveGrade;
    this.academicClearance = entity.academicClearance;
  }
}