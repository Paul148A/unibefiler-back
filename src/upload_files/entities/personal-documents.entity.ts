import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RecordEntity } from './record.entity';
import { DocumentStatusEntity } from '../../core/entities/document-status.entity';

@Entity('personal_documents', { schema: 'upload_files' })
export class PersonalDocumentsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign keys */
  @ManyToOne(() => RecordEntity, (record) => record.personalDocuments)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  /** Columns **/
  @Column({ 
    type: 'varchar',
    name: 'picture_doc',
    comment: 'Foto del estudiante tamaño carnet',
    nullable: true,
   })
  pictureDoc: string;

  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'picture_doc_status_id' })
  pictureDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 'dni_doc',
    comment: 'Foto del documento de identidad',
    nullable: true,
  })
  dniDoc: string;

  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'dni_doc_status_id' })
  dniDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 'voting_ballot_doc',
    comment: 'Foto del documento de la papeleta de votacion',
    nullable: true,
  })
  votingBallotDoc: string;

  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'voting_ballot_doc_status_id' })
  votingBallotDocStatus: DocumentStatusEntity;

  @Column({
    type: 'varchar',
    name: 'notariz_degree_doc',
    comment: 'Foto del documento del titulo notariado',
    nullable: true,
  })
  notarizDegreeDoc: string;

  @ManyToOne(() => DocumentStatusEntity)
  @JoinColumn({ name: 'notariz_degree_doc_status_id' })
  notarizDegreeDocStatus: DocumentStatusEntity;

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