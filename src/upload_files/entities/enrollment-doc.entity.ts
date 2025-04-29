import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { InscriptionDocumentsEntity } from './inscription-documents.entity';

@Entity('enrollment_doc', { schema: 'upload_files' })
export class EnrollmentDocEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Foreign keys */
    @OneToOne(() => InscriptionDocumentsEntity, (inscriptionDocument) => inscriptionDocument.enrollmentDocs)
    @JoinColumn({ name: 'record_id' })
    inscriptionDocument: InscriptionDocumentsEntity;

    @Column()
    name: string;

    @Column()
    description: string;

}