// import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PersonalDocuments } from './personal-documents.entity';
import { InscriptionForm } from './inscription-form.entity';
import { Degree } from './degree.entity';
import { UserEntity } from 'src/auth/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('record')
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  personal_documents_id: string;

  @Column({ nullable: true })
  inscription_form_id: string;

  @Column({ nullable: true })
  degree_id: string;

  @OneToOne(() => PersonalDocuments)
  @JoinColumn({ name: 'personal_documents_id' })
  personalDocuments: PersonalDocuments;

  @OneToOne(() => InscriptionForm)
  @JoinColumn({ name: 'inscription_form_id' })
  inscriptionForm: InscriptionForm;

  @OneToOne(() => Degree)
  @JoinColumn({ name: 'degree_id' })
  degree: Degree;

  @OneToOne(() => UserEntity, (user) => user.record)
  user: UserEntity;
}