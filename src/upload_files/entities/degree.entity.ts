import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('degree')
export class Degree {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  topic_complain_doc: string;

  @Column({ nullable: true })
  topic_approval_doc: string;

  @Column({ nullable: true })
  tutor_assignment_doc: string;

  @Column({ nullable: true })
  tutor_format_doc: string;

  @Column({ nullable: true })
  antiplagiarism_doc: string;

  @Column({ nullable: true })
  tutor_letter: string;

  @Column({ nullable: true })
  elective_grade: string;

  @Column({ nullable: true })
  academic_clearance: string;
}