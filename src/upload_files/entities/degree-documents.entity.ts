import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RecordEntity } from './record.entity';
import { DocumentStatusEntity } from '../../core/entities/document-status.entity';

@Entity('degree_documents', { schema: 'upload_files' })
export class DegreeDocumentsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign keys */
  @ManyToOne(() => RecordEntity, (record) => record.degreeDocuments)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @Column({ 
    type: 'varchar',
    name: 'topic_complain_doc',
    comment: 'Solicitud de tema de tesis',
    nullable: true,
   })
  topicComplainDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'topic_complain_doc_status_id' })
  topicComplainDocStatus: DocumentStatusEntity;

  @Column({ 
    type: 'varchar',
    name: 'topic_approval_doc',
    comment: 'Aprobacion de tema de tesis',
    nullable: true, 
  })
  topicApprovalDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'topic_approval_doc_status_id' })
  topicApprovalDocStatus: DocumentStatusEntity;

  @Column({ 
    type: 'varchar',
    name: 'tutor_assignment_doc',
    comment: 'Documento de asigancion de tutor',
    nullable: true, 
   })
  tutorAssignmentDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'tutor_assignment_doc_status_id' })
  tutorAssignmentDocStatus: DocumentStatusEntity;

  @Column({ 
    type: 'varchar',
    name: 'tutor_format_doc',
    comment: 'Documento horas de tutoria con el tutor',
    nullable: true, 
   })
  tutorFormatDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'tutor_format_doc_status_id' })
  tutorFormatDocStatus: DocumentStatusEntity;

  @Column({ 
    type: 'varchar',
    name: 'antiplagiarism_doc',
    comment: 'Documento de antiplagio',
    nullable: true,
   })
  antiplagiarismDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'antiplagiarism_doc_status_id' })
  antiplagiarismDocStatus: DocumentStatusEntity;

  @Column({ 
    type: 'varchar',
    name: 'tutor_letter',
    comment: 'Carta de tutor',
    nullable: true,
   })
  tutorLetter: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'tutor_letter_status_id' })
  tutorLetterStatus: DocumentStatusEntity;

  @Column({ 
    type: 'varchar',
    name: 'elective_grade',
    comment: 'Documento de nota de grado electivo',
    nullable: true,
   })
  electiveGrade: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'elective_grade_status_id' })
  electiveGradeStatus: DocumentStatusEntity;

  @Column({ 
    type: 'varchar',
    name: 'academic_clearance',
    comment: 'Documento de libre de deuda',
    nullable: true,
   })
  academicClearance: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'academic_clearance_status_id' })
  academicClearanceStatus: DocumentStatusEntity;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: 'Fecha y hora de subida del documento',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: 'Fecha y hora de última actualización del documento',
    nullable: true,
  })
  updatedAt: Date;
}