import { PermissionDocumentsEntity } from '../../entities/permission-documents.entity';

export class PermissionDocumentsResponseDto {
  id: string;
  record_id: string;
  supportingDoc: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(permissionDocuments: PermissionDocumentsEntity) {
    this.id = permissionDocuments.id;
    this.record_id = permissionDocuments.record?.id || '';
    this.supportingDoc = permissionDocuments.supportingDoc;
    this.createdAt = permissionDocuments.createdAt;
    this.updatedAt = permissionDocuments.updatedAt;
  }
} 