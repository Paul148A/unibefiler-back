import { PersonalDocumentsEntity } from "src/upload_files/entities/personal-documents.entity";

export class PersonalDocumentsResponseDto {
  id: string;
  pictureDoc: string;
  dniDoc: string;
  votingBallotDoc: string;
  notarizDegreeDoc: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: PersonalDocumentsEntity) {
    this.id = entity.id;
    this.pictureDoc = entity.pictureDoc;
    this.dniDoc = entity.dniDoc;
    this.votingBallotDoc = entity.votingBallotDoc;
    this.notarizDegreeDoc = entity.notarizDegreeDoc;
  }
}