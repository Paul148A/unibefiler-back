import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserFolderService } from './user-folder.service';
import { FileNamingService } from './file-naming.service';

@Injectable()
export class BaseDocumentService {
  constructor(
    protected readonly userFolderService: UserFolderService
  ) {}

  /**
   * Crea un interceptor de archivos que guarda en la carpeta del usuario
   * @param userIdentification - La identificación del usuario
   * @param documentType - El tipo de documento (ej: 'documentos-grado')
   * @param fields - Los campos de archivo a interceptar
   * @returns El interceptor configurado
   */
  static getFileFieldsInterceptor(
    userIdentification: string,
    documentType: string,
    fields: Array<{ name: string; maxCount: number }>
  ) {
    return FileFieldsInterceptor(fields, {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const userFolderService = new UserFolderService();
          const userDocFolder = userFolderService.getUserDocumentFolder(userIdentification, documentType);
          callback(null, userDocFolder);
        },
        filename: (req, file, callback) => {
          const fileNamingService = new FileNamingService();
          const standardFileName = fileNamingService.generateStandardFileName(
            file.fieldname,
            userIdentification,
            file.originalname
          );
          
          const ext = extname(file.originalname);
          const finalFileName = `${standardFileName}${ext}`;
          
          callback(null, finalFileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    });
  }

  /**
   * Obtiene la ruta de archivo para un usuario específico
   * @param userIdentification - La identificación del usuario
   * @param documentType - El tipo de documento
   * @param filename - El nombre del archivo
   * @returns La ruta completa del archivo
   */
  getUserDocumentFilePath(
    userIdentification: string,
    documentType: string,
    filename: string
  ): string {
    const userDocFolder = this.userFolderService.getUserDocumentFolder(userIdentification, documentType);
    return `${userDocFolder}/${filename}`;
  }

  /**
   * Verifica si un archivo existe en la carpeta del usuario
   * @param userIdentification - La identificación del usuario
   * @param documentType - El tipo de documento
   * @param filename - El nombre del archivo
   * @returns true si existe, false si no
   */
  userDocumentFileExists(
    userIdentification: string,
    documentType: string,
    filename: string
  ): boolean {
    const fs = require('fs');
    const filePath = this.getUserDocumentFilePath(userIdentification, documentType, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Elimina un archivo de la carpeta del usuario
   * @param userIdentification - La identificación del usuario
   * @param documentType - El tipo de documento
   * @param filename - El nombre del archivo
   */
  deleteUserDocumentFile(
    userIdentification: string,
    documentType: string,
    filename: string
  ): void {
    const fs = require('fs');
    const filePath = this.getUserDocumentFilePath(userIdentification, documentType, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
