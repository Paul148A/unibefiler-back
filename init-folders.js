/**
 * Script de inicialización para crear todas las carpetas necesarias
 * Este script debe ejecutarse antes de iniciar el servidor
 */

const fs = require('fs');
const path = require('path');

const baseUploadsPath = path.join(process.cwd(), 'uploads');
const tempPath = path.join(baseUploadsPath, 'temp');
const documentTypes = [
  'documentos-grado',
  'documentos-inscripcion',
  'documentos-matriculas',
  'documentos-notas',
  'documentos-permisos',
  'documentos-personales'
];

const exampleUser = '1234567890';

if (!fs.existsSync(baseUploadsPath)) {
  fs.mkdirSync(baseUploadsPath, { recursive: true });
} else {
}

if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
} else {
}

documentTypes.forEach(docType => {
  const docTypePath = path.join(baseUploadsPath, docType);
  if (!fs.existsSync(docTypePath)) {
    fs.mkdirSync(docTypePath, { recursive: true });
  } else {
  }
  
  const userDocPath = path.join(docTypePath, exampleUser);
  if (!fs.existsSync(userDocPath)) {
    fs.mkdirSync(userDocPath, { recursive: true });
  } else {
  }
});

const gitkeepPath = path.join(baseUploadsPath, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
}

const tempGitkeepPath = path.join(tempPath, '.gitkeep');
if (!fs.existsSync(tempGitkeepPath)) {
  fs.writeFileSync(tempGitkeepPath, '');
}

try {
  const testFile = path.join(tempPath, 'test-write.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
} catch (error) {
  console.error('Error de permisos de escritura:', error.message);
}

