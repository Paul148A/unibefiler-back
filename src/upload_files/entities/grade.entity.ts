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
    @ManyToOne(() => InscriptionDocumentsEntity, (inscriptionDocuments) => inscriptionDocuments.grades)
    @JoinColumn({ name: 'inscription_documents_id' })
    inscriptionDocument: InscriptionDocumentsEntity;

    @ManyToOne(() => SemesterEntity, (semester) => semester.grades)
    @JoinColumn({ name: 'semester_id' })
    semester: SemesterEntity;

    @Column({ 
    type: 'varchar',
    name: 'name',
    comment: 'Nombre del documento de notas',
    nullable: true,
   })
    name: string;

    @Column({ 
    type: 'varchar',
    name: 'description',
    comment: 'Descripcion del documeno de notas',
    nullable: true,
   })
    description: string;

}