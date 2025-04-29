import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RecordEntity } from './record.entity';

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
   })
  pictureDoc: string;

  @Column({
    type: 'varchar',
    name: 'dni_doc',
    comment: 'Foto del documento de identidad',
  })
  dniDoc: string;

  @Column({
    type: 'varchar',
    name: 'voting_ballot_doc',
    comment: 'Foto del documento de la papeleta de votacion',
  })
  votingBallotDoc: string;

  @Column({
    type: 'varchar',
    name: 'notariz_degree_doc',
    comment: 'Foto del documento del titulo notariado',
  })
  notarizDegreeDoc: string;
}