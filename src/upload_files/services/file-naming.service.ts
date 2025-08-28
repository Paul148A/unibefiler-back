import { Injectable } from '@nestjs/common';

@Injectable()
export class FileNamingService {
  /**
   * Mapeo de códigos de documentos según el estándar de la imagen
   */
  private readonly documentCodes = {
    // Documentos Personales
    pictureDoc: 'PDS', // Picture Document Student
    dniDoc: 'DNI', // National Identity Card
    votingBallotDoc: 'VBD', // Voting Ballot Document
    notarizDegreeDoc: 'NDD', // Notarized Degree Document
    
    // Documentos de Inscripción
    registration_doc: 'RD', // Registration Document
    semester_grade_chart_doc: 'SGCD', // Semester Grade Chart Document
    re_entry_doc: 'RED', // Re-Entry Document
    english_certificate_doc: 'ECD', // English Certificate Document
    enrollment_certificate_doc: 'ENRCD', // Enrollment Certificate Document
    approval_doc: 'AD', // Approval Document
    
    // Documentos de Grado
    topic_complain_doc: 'TCD', // Topic Complain Document
    topic_approval_doc: 'TAD', // Topic Approval Document
    tutor_assignment_doc: 'TUTAD', // Tutor Assignment Document
    tutor_format_doc: 'TFD', // Tutor Format Document
    antiplagiarism_doc: 'ANTD', // Anti Plagiarism Document
    tutor_letter: 'TL', // Tutor Letter
    elective_grade: 'EG', // Elective Grade
    academic_clearance: 'AC', // Academic Clearance
    
    // Documentos de Matrícula (usar código genérico)
    file: 'ENR', // Enrollment
  };

  /**
   * Mapeo de campos de DTOs a campos de interceptores
   */
  private readonly fieldMapping = {
    // Documentos de Inscripción
    registrationDoc: 'registration_doc',
    semesterGradeChartDoc: 'semester_grade_chart_doc',
    reEntryDoc: 're_entry_doc',
    englishCertificateDoc: 'english_certificate_doc',
    enrollmentCertificateDoc: 'enrollment_certificate_doc',
    approvalDoc: 'approval_doc',
    
    // Documentos de Grado
    topicComplainDoc: 'topic_complain_doc',
    topicApprovalDoc: 'topic_approval_doc',
    tutorAssignmentDoc: 'tutor_assignment_doc',
    tutorFormatDoc: 'tutor_format_doc',
    antiplagiarismDoc: 'antiplagiarism_doc',
    tutorLetter: 'tutor_letter',
    electiveGrade: 'elective_grade',
    academicClearance: 'academic_clearance',
  };

  /**
   * Genera el nombre estándar del archivo según el formato: codigo-identification-nombredelcampodelabasededatos
   * @param fieldName - Nombre del campo del archivo
   * @param userIdentification - Identificación del usuario
   * @param originalName - Nombre original del archivo (opcional, ya no se usa)
   * @returns Nombre del archivo en formato estándar
   */
  generateStandardFileName(
    fieldName: string, 
    userIdentification: string, 
    originalName?: string
  ): string {
    // Mapear el campo del DTO al campo del interceptor si es necesario
    const mappedFieldName = this.fieldMapping[fieldName] || fieldName;
    
    // Obtener el código del documento
    const documentCode = this.documentCodes[mappedFieldName] || 'DOC';
    
    // Obtener el nombre del campo de la base de datos
    const documentName = this.getDocumentName(mappedFieldName);
    
    // Generar el nombre estándar: codigo-identification-nombredelcampodelabasededatos
    const standardFileName = `${documentCode}-${userIdentification}-${documentName}`;
    
    return standardFileName;
  }

  /**
   * Obtiene el nombre legible del documento basado en el campo
   * @param fieldName - Nombre del campo del archivo
   * @returns Nombre legible del documento
   */
  private getDocumentName(fieldName: string): string {
    const documentNames = {
      // Documentos Personales
      pictureDoc: 'pictureDoc',
      dniDoc: 'dniDoc',
      votingBallotDoc: 'votingBallotDoc',
      notarizDegreeDoc: 'notarizDegreeDoc',
      
      // Documentos de Inscripción
      registration_doc: 'registration_doc',
      semester_grade_chart_doc: 'semester_grade_chart_doc',
      re_entry_doc: 're_entry_doc',
      english_certificate_doc: 'english_certificate_doc',
      enrollment_certificate_doc: 'enrollment_certificate_doc',
      approval_doc: 'approval_doc',
      
      // Documentos de Grado
      topic_complain_doc: 'topic_complain_doc',
      topic_approval_doc: 'topic_approval_doc',
      tutor_assignment_doc: 'tutor_assignment_doc',
      tutor_format_doc: 'tutor_format_doc',
      antiplagiarism_doc: 'antiplagiarism_doc',
      tutor_letter: 'tutor_letter',
      elective_grade: 'elective_grade',
      academic_clearance: 'academic_clearance',
      
      // Documentos de Matrícula
      file: 'file',
    };

    return documentNames[fieldName] || 'Documento';
  }

  /**
   * Obtiene el código del documento para un campo específico
   * @param fieldName - Nombre del campo del archivo
   * @returns Código del documento
   */
  getDocumentCode(fieldName: string): string {
    // Mapear el campo del DTO al campo del interceptor si es necesario
    const mappedFieldName = this.fieldMapping[fieldName] || fieldName;
    return this.documentCodes[mappedFieldName] || 'DOC';
  }

  /**
   * Verifica si un campo tiene un código de documento válido
   * @param fieldName - Nombre del campo del archivo
   * @returns true si tiene código válido, false si no
   */
  hasValidDocumentCode(fieldName: string): boolean {
    // Mapear el campo del DTO al campo del interceptor si es necesario
    const mappedFieldName = this.fieldMapping[fieldName] || fieldName;
    return mappedFieldName in this.documentCodes;
  }

  /**
   * Obtiene todos los códigos de documentos disponibles
   * @returns Objeto con todos los códigos
   */
  getAllDocumentCodes(): Record<string, string> {
    return { ...this.documentCodes };
  }

  /**
   * Obtiene el mapeo de campos
   * @returns Objeto con el mapeo de campos
   */
  getFieldMapping(): Record<string, string> {
    return { ...this.fieldMapping };
  }
}
