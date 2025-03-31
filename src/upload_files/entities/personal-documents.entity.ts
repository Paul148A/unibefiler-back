import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('personal_documents')
export class PersonalDocuments {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  picture_doc: string;

  @Column({ nullable: true })
  dni_doc: string;

  @Column({ nullable: true })
  voting_ballot_doc: string;

  @Column({ nullable: true })
  notariz_degree_doc: string;
}