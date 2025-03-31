import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inscription_form')
export class InscriptionForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  registration_doc: string;

  @Column({ nullable: true })
  semester_grade_chart_doc: string;

  @Column({ nullable: true })
  re_entry_doc: string;

  @Column({ nullable: true })
  english_certificate_doc: string;

  @Column({ nullable: true })
  enrollment_certificate_doc: string;

  @Column({ nullable: true })
  approval_doc: string;

}