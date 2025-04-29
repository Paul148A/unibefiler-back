import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { GradeEnrollmentEntity } from './grade-enrollment.entity';
import { EnrollmentDocEntity } from './enrollment-doc.entity';
import { RecordEntity } from './record.entity';

@Entity('inscription_documents', { schema: 'upload_files' })
export class InscriptionDocumentsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign Keys **/
  @ManyToOne(() => RecordEntity, (record) => record.inscriptionDocuments)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  @OneToMany(() => GradeEnrollmentEntity, (gradeEnrollment) => gradeEnrollment.inscriptionDocument)
  gradeEnrollments: GradeEnrollmentEntity[];

  @OneToMany(() => EnrollmentDocEntity, (enrollmentDoc) => enrollmentDoc.inscriptionDocument)
  enrollmentDocs: EnrollmentDocEntity[];

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'registration_doc',
    comment: 'Documento de registro',
  })
  registrationDoc: string;

  @Column({
    type: 'varchar',
    name: 'semester_grade_chart_doc',
    comment: 'Documento con las notas del semestre',
  })
  semesterGradeChartDoc: string;

  @Column({
    type: 'varchar',
    name: 're_entry_doc',
    comment: 'Documento de reingreso (en caso de ser necesario)',
  })
  reEntryDoc: string;

  @Column({
    type: 'varchar',
    name: 'englishCertificateDoc',
    comment: 'Documento de aprobacion del ingles',
  })
  englishCertificateDoc: string;
  
  @Column({
    type: 'varchar',
    name: 'enrollment_certificate_doc',
    comment: 'Documento con el certificado de las notas',
  })
  enrollmentCertificateDoc: string;

  @Column({
    type: 'varchar',
    name: 'approval_doc',
    comment: 'Documento de aprobacion',
  })
  approvalDoc: string;

}