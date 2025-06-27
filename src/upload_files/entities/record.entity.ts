import { UserEntity } from 'src/auth/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PersonalDocumentsEntity } from './personal-documents.entity';
import { InscriptionDocumentsEntity } from './inscription-documents.entity';
import { DegreeDocumentsEntity } from './degree-documents.entity';
import { PermissionDocumentsEntity } from './permission-documents.entity';

@Entity('record', { schema: 'upload_files' })
export class RecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign keys */
  @OneToOne(() => UserEntity, (user) => user.record)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => PersonalDocumentsEntity, (personalDocument) => personalDocument.record)
  personalDocuments: PersonalDocumentsEntity[];

  @OneToMany(() => InscriptionDocumentsEntity, (inscriptionDocument) => inscriptionDocument.record)
  inscriptionDocuments: InscriptionDocumentsEntity[];

  @OneToMany(() => DegreeDocumentsEntity, (degreeDocument) => degreeDocument.record)
  degreeDocuments: DegreeDocumentsEntity[];

  @OneToMany(() => PermissionDocumentsEntity, (permissionDocument) => permissionDocument.record)
  permissionDocuments: PermissionDocumentsEntity[];

  /** Columns **/
  @Column({
    type: 'varchar',
    name: 'code',
    unique: true,
    comment: 'Codigo del expediente',
  })
  code: string;

  
}