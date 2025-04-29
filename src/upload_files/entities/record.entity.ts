import { UserEntity } from 'src/auth/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PersonalDocumentsEntity } from './personal-documents.entity';
import { InscriptionDocumentsEntity } from './inscription-documents.entity';
import { DegreeDocumentsEntity } from './degree-documents.entity';

@Entity('record', { schema: 'upload_files' })
export class RecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign keys */
  @OneToMany(() => UserEntity, (user) => user.record)
  user: UserEntity;

  @OneToMany(() => PersonalDocumentsEntity, (personalDocument) => personalDocument.record)
  personalDocuments: PersonalDocumentsEntity[];

  @OneToMany(() => InscriptionDocumentsEntity, (inscriptionDocument) => inscriptionDocument.record)
  inscriptionDocuments: InscriptionDocumentsEntity[];

  @OneToMany(() => DegreeDocumentsEntity, (degreeDocument) => degreeDocument.record)
  degreeDocuments: DegreeDocumentsEntity[];

  /** Columns **/
  @Column({
    type: 'varchar',
    name: 'code',
    comment: 'Codigo del expediente',
  })
  code: string;

  
}