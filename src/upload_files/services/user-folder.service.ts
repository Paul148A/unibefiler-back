import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserFolderService {
  private readonly baseUploadsPath = './uploads';

  /**
   * @param userIdentification
   * @returns
   */
  createUserFolderStructure(userIdentification: string): string {
    const documentTypes = [
      'documentos-grado',
      'documentos-inscripcion', 
      'documentos-matriculas',
      'documentos-notas',
      'documentos-permisos',
      'documentos-personales'
    ];

    documentTypes.forEach(docType => {
      const docTypePath = path.join(this.baseUploadsPath, docType, userIdentification);
      if (!fs.existsSync(docTypePath)) {
        fs.mkdirSync(docTypePath, { recursive: true });
      }
    });

    return path.join(this.baseUploadsPath, 'documentos-personales', userIdentification);
  }

  /**
   * @param userIdentification
   * @param documentType
   * @returns
   */
  getUserDocumentFolder(userIdentification: string, documentType: string): string {
    const documentFolderPath = path.join(this.baseUploadsPath, documentType, userIdentification);
    
    if (!fs.existsSync(documentFolderPath)) {
      fs.mkdirSync(documentFolderPath, { recursive: true });
    }
    
    return documentFolderPath;
  }

  /**
   * @param userIdentification
   */
  deleteUserFolder(userIdentification: string): void {

    
    const documentTypes = [
      'documentos-grado',
      'documentos-inscripcion', 
      'documentos-matriculas',
      'documentos-notas',
      'documentos-permisos',
      'documentos-personales'
    ];

    documentTypes.forEach(docType => {
      const docTypePath = path.join(this.baseUploadsPath, docType, userIdentification);
      if (fs.existsSync(docTypePath)) {
        fs.rmSync(docTypePath, { recursive: true, force: true });
      }
    });
  }

  /**
   * @param userIdentification
   * @returns
   */
  userFolderExists(userIdentification: string): boolean {
    const userFolderPath = path.join(this.baseUploadsPath, 'documentos-personales', userIdentification);
    return fs.existsSync(userFolderPath);
  }

  /**
   * @returns
   */
  getBaseUploadsPath(): string {
    return this.baseUploadsPath;
  }
}
