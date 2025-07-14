export class CreatePersonalDocumentsDto {
  record_id: string;
  pictureDoc: string;
  pictureDocStatus?: string;
  dniDoc: string;
  dniDocStatus?: string;
  votingBallotDoc: string;
  votingBallotDocStatus?: string;
  notarizDegreeDoc: string;
  notarizDegreeDocStatus?: string;
}