import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RecordEntity } from './record.entity';

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

  @Column({ 
    type: 'varchar',
    name: 'topic_approval_doc',
    comment: 'Aprobacion de tema de tesis',
    nullable: true, 
  })
  topicApprovalDoc: string;

  @Column({ 
    type: 'varchar',
    name: 'tutor_assignment_doc',
    comment: 'Documento de asigancion de tutor',
    nullable: true, 
   })
  tutorAssignmentDoc: string;

  @Column({ 
    type: 'varchar',
    name: 'tutor_format_doc',
    comment: 'Documento horas de tutoria con el tutor',
    nullable: true, 
   })
  tutorFormatDoc: string;

  @Column({ 
    type: 'varchar',
    name: 'antiplagiarism_doc',
    comment: 'Documento de antiplagio',
    nullable: true,
   })
  antiplagiarismDoc: string;

  @Column({ 
    type: 'varchar',
    name: 'tutor_letter',
    comment: 'Carta de tutor',
    nullable: true,
   })
  tutorLetter: string;

  @Column({ 
    type: 'varchar',
    name: 'elective_grade',
    comment: 'Documento de nota de grado electivo',
    nullable: true,
   })
  electiveGrade: string;

  @Column({ 
    type: 'varchar',
    name: 'academic_clearance',
    comment: 'Documento de libre de deuda',
    nullable: true,
   })
  academicClearance: string;
}