import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InscriptionDocumentsEntity } from './inscription-documents.entity';
import { SemesterEntity } from 'src/core/entities/semester.entity';

@Entity('enrollments', { schema: 'upload_files' })
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign keys */
  @ManyToOne(() => InscriptionDocumentsEntity, (inscriptionDocument) => inscriptionDocument.enrollments)
  @JoinColumn({ name: 'inscription_documents_id' })
  inscriptionDocument: InscriptionDocumentsEntity;

  @ManyToOne(() => SemesterEntity, (semester) => semester.enrollments)
  @JoinColumn({ name: 'semester_id' })
  semester: SemesterEntity;

  @Column({ 
    type: 'varchar',
    name: 'name',
    comment: 'Nombre del documento de matricula',
    nullable: true,
   })
  name: string;

  @Column({
      type: 'varchar',
      name: 'description',
      comment: 'Descripcion del documento de matricula',
      nullable: true,
    })
  description: string;
}