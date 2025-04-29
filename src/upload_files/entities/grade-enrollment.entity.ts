import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { InscriptionDocumentsEntity } from './inscription-documents.entity';

@Entity('grade_enrollment', { schema: 'upload_files' })
export class GradeEnrollmentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Foreign keys */
    @OneToOne(() => InscriptionDocumentsEntity, (inscriptionDocuments) => inscriptionDocuments.gradeEnrollments)
    @JoinColumn({ name: 'inscription_documents_id' })
    inscriptionDocument: InscriptionDocumentsEntity;

    @Column()
    name: string;

    @Column()
    description: string;

}