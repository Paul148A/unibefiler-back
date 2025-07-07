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

@Entity('grades', { schema: 'upload_files' })
export class GradeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Foreign keys */
    @OneToOne(() => InscriptionDocumentsEntity, (inscriptionDocuments) => inscriptionDocuments.grades)
    @JoinColumn({ name: 'inscription_documents_id' })
    inscriptionDocument: InscriptionDocumentsEntity;

    @OneToOne(() => SemesterEntity, (semester) => semester.grades)
    @JoinColumn({ name: 'semester_id' })
    semester: SemesterEntity;

    @Column()
    name: string;

    @Column()
    description: string;

}