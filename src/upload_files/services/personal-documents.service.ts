import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { PersonalDocumentsEntity } from '../entities/personal-documents.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';

@Injectable()
export class PersonalDocumentsService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.PERSONAL_DOCUMENTS_REPOSITORY)
    private readonly personalDocumentsRepository: Repository<PersonalDocumentsEntity>,
  ) {}

  async savePersonalDocuments(
    pictureDoc: string,
    dniDoc: string,
    votingBallotDoc: string,
    notarizDegreeDoc: string,
  ): Promise<PersonalDocumentsEntity> {
    const personalDocuments = new PersonalDocumentsEntity();
    personalDocuments.pictureDoc = pictureDoc;
    personalDocuments.dniDoc = dniDoc;
    personalDocuments.votingBallotDoc = votingBallotDoc;
    personalDocuments.notarizDegreeDoc = notarizDegreeDoc;
    return this.personalDocumentsRepository.save(personalDocuments);
  }

async updatePersonalDocuments(
  id: string,
  updates: Partial<{
    pictureDoc: string;
    dniDoc: string;
    votingBallotDoc: string;
    notarizDegreeDoc: string;
  }>,
): Promise<PersonalDocumentsEntity> {
  const document = await this.personalDocumentsRepository.findOne({
    where: { id },
  });
  
  if (!document) {
    throw new NotFoundException(`Documentos personales con ID ${id} no encontrados`);
  }

  if (updates.pictureDoc !== undefined) document.pictureDoc = updates.pictureDoc;
  if (updates.dniDoc !== undefined) document.dniDoc = updates.dniDoc;
  if (updates.votingBallotDoc !== undefined) document.votingBallotDoc = updates.votingBallotDoc;
  if (updates.notarizDegreeDoc !== undefined) document.notarizDegreeDoc = updates.notarizDegreeDoc;

  return this.personalDocumentsRepository.save(document);
}

  async getAllPersonalDocuments(): Promise<PersonalDocumentsEntity[]> {
    return this.personalDocumentsRepository.find();
  }

  async deletePersonalDocuments(id: string): Promise<DeleteResult> {
  return this.personalDocumentsRepository.delete(id);
}
}
