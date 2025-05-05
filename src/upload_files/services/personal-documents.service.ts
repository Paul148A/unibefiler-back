import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
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
    updatedFiles: {
      pictureDoc?: string;
      dniDoc?: string;
      votingBallotDoc?: string;
      notarizDegreeDoc?: string;
    },
  ): Promise<PersonalDocumentsEntity> {
    const PersonalDocumentsEntity = await this.personalDocumentsRepository.findOne({
      where: { id },
    });
    if (!PersonalDocumentsEntity) {
      throw new NotFoundException(
        `Documentos personales con ID ${id} no encontrados`,
      );
    }

    if (updatedFiles.pictureDoc !== undefined) {
      PersonalDocumentsEntity.pictureDoc = updatedFiles.pictureDoc;
    }
    if (updatedFiles.dniDoc !== undefined) {
      PersonalDocumentsEntity.dniDoc = updatedFiles.dniDoc;
    }
    if (updatedFiles.votingBallotDoc !== undefined) {
      PersonalDocumentsEntity.votingBallotDoc = updatedFiles.votingBallotDoc;
    }
    if (updatedFiles.notarizDegreeDoc !== undefined) {
      PersonalDocumentsEntity.notarizDegreeDoc = updatedFiles.notarizDegreeDoc;
    }
    return this.personalDocumentsRepository.save(PersonalDocumentsEntity);
  }

  async getAllPersonalDocuments(): Promise<PersonalDocumentsEntity[]> {
    return this.personalDocumentsRepository.find();
  }
}
