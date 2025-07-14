import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RecordEntity } from './record.entity';

@Entity('permission_documents', { schema: 'upload_files' })
export class PermissionDocumentsEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Foreign keys */
  @ManyToOne(() => RecordEntity, (record) => record.permissionDocuments)
  @JoinColumn({ name: 'record_id' })
  record: RecordEntity;

  /** Columns **/
  @Column({
    type: 'varchar',
    name: 'supporting_doc',
    comment: 'Documento de respaldo',
    nullable: false,
  })
  supportingDoc: string;

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