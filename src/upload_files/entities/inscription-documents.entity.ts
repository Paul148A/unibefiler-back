import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { GradeEntity } from './grade.entity';
import { EnrollmentDocEntity } from './enrollment-documents.entity';
import { RecordEntity } from './record.entity';
import { DocumentStatusEntity } from '../../core/entities/document-status.entity';

@Entity('inscription_documents', { schema: 'upload_files' })
export class InscriptionDocumentsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign Keys **/
  @ManyToOne(() => RecordEntity, (record) => record.inscriptionDocuments)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @OneToMany(() => GradeEntity, (grade) => grade.inscriptionDocument)
  grades: GradeEntity[];

  @OneToMany(() => EnrollmentDocEntity, (enrollmentDoc) => enrollmentDoc.inscriptionDocument)
  enrollmentDocs: EnrollmentDocEntity[];

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'registration_doc',
    comment: 'Documento de registro',
  })
  registrationDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'registration_doc_status_id' })
  registrationDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 'semester_grade_chart_doc',
    comment: 'Documento con las notas del semestre',
    nullable: true,
  })
  semesterGradeChartDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'semester_grade_chart_doc_status_id' })
  semesterGradeChartDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 're_entry_doc',
    comment: 'Documento de reingreso (en caso de ser necesario)',
    nullable: true,
  })
  reEntryDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 're_entry_doc_status_id' })
  reEntryDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 'englishCertificateDoc',
    comment: 'Documento de aprobacion del ingles',
    nullable: true,
  })
  englishCertificateDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'english_certificate_doc_status_id' })
  englishCertificateDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 'enrollment_certificate_doc',
    comment: 'Documento con el certificado de las notas',
    nullable: true,
  })
  enrollmentCertificateDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'enrollment_certificate_doc_status_id' })
  enrollmentCertificateDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 'approval_doc',
    comment: 'Documento de aprobacion',
    nullable: true,
  })
  approvalDoc: string;
  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'approval_doc_status_id' })
  approvalDocStatus: DocumentStatusEntity;

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