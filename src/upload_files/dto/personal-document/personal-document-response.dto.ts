import { PersonalDocumentsEntity } from "src/upload_files/entities/personal-documents.entity";

export class PersonalDocumentsResponseDto {
  id: string;
  pictureDoc: string;
  pictureDocStatus?: { id: string; name: string };
  dniDoc: string;
  dniDocStatus?: { id: string; name: string };
  votingBallotDoc: string;
  votingBallotDocStatus?: { id: string; name: string };
  notarizDegreeDoc: string;
  notarizDegreeDocStatus?: { id: string; name: string };
  record?: {
    id: string;
    user?: {
      identification: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: PersonalDocumentsEntity) {
    this.id = entity.id;
    this.pictureDoc = entity.pictureDoc;
    this.pictureDocStatus = entity.pictureDocStatus ? { id: entity.pictureDocStatus.id, name: entity.pictureDocStatus.name } : undefined;
    this.dniDoc = entity.dniDoc;
    this.dniDocStatus = entity.dniDocStatus ? { id: entity.dniDocStatus.id, name: entity.dniDocStatus.name } : undefined;
    this.votingBallotDoc = entity.votingBallotDoc;
    this.votingBallotDocStatus = entity.votingBallotDocStatus ? { id: entity.votingBallotDocStatus.id, name: entity.votingBallotDocStatus.name } : undefined;
    this.notarizDegreeDoc = entity.notarizDegreeDoc;
    this.notarizDegreeDocStatus = entity.notarizDegreeDocStatus ? { id: entity.notarizDegreeDocStatus.id, name: entity.notarizDegreeDocStatus.name } : undefined;
    this.record = entity.record ? {
      id: entity.record.id,
      user: entity.record.user ? {
        identification: entity.record.user.identification
      } : undefined
    } : undefined;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}