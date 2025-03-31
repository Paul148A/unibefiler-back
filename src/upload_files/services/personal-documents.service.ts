import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalDocuments } from '../entities/personal-documents.entity';

@Injectable()
export class PersonalDocumentsService {
  constructor(
    @InjectRepository(PersonalDocuments)
    private readonly personalDocumentsRepository: Repository<PersonalDocuments>,
  ) {}

  async savePersonalDocuments(
    pictureDoc: string,
    dniDoc: string,
    votingBallotDoc: string,
    notarizDegreeDoc: string,
  ): Promise<PersonalDocuments> {
    const personalDocuments = new PersonalDocuments();
    personalDocuments.picture_doc = pictureDoc;
    personalDocuments.dni_doc = dniDoc;
    personalDocuments.voting_ballot_doc = votingBallotDoc;
    personalDocuments.notariz_degree_doc = notarizDegreeDoc;
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
  ): Promise<PersonalDocuments> {
    const personalDocuments = await this.personalDocumentsRepository.findOne({
      where: { id },
    });
    if (!personalDocuments) {
      throw new NotFoundException(
        `Documentos personales con ID ${id} no encontrados`,
      );
    }

    if (updatedFiles.pictureDoc !== undefined) {
      personalDocuments.picture_doc = updatedFiles.pictureDoc;
    }
    if (updatedFiles.dniDoc !== undefined) {
      personalDocuments.dni_doc = updatedFiles.dniDoc;
    }
    if (updatedFiles.votingBallotDoc !== undefined) {
      personalDocuments.voting_ballot_doc = updatedFiles.votingBallotDoc;
    }
    if (updatedFiles.notarizDegreeDoc !== undefined) {
      personalDocuments.notariz_degree_doc = updatedFiles.notarizDegreeDoc;
    }
    return this.personalDocumentsRepository.save(personalDocuments);
  }

  async getAllPersonalDocuments(): Promise<PersonalDocuments[]> {
    return this.personalDocumentsRepository.find();
  }
}
