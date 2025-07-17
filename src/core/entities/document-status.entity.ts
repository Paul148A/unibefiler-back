import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('document_status', { schema: 'core' })
export class DocumentStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    name: 'name',
    unique: true,
    comment: 'Nombre del estado (aprobado, rechazado, en revisión, etc.)',
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'description',
    nullable: true,
    comment: 'Descripción opcional del estado',
  })
  description?: string;
}