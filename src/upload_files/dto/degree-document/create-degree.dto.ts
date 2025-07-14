export class CreateDegreeDto {
  record_id: string;
  topicComplainDoc: string;
  topicComplainDocStatus?: string;
  topicApprovalDoc: string;
  topicApprovalDocStatus?: string;
  tutorAssignmentDoc: string;
  tutorAssignmentDocStatus?: string;
  tutorFormatDoc: string;
  tutorFormatDocStatus?: string;
  antiplagiarismDoc: string;
  antiplagiarismDocStatus?: string;
  tutorLetter: string;
  tutorLetterStatus?: string;
  electiveGrade: string;
  electiveGradeStatus?: string;
  academicClearance: string;
  academicClearanceStatus?: string;
}