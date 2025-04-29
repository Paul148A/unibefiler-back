import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DegreeDocumentsEntity } from '../entities/degree-documents.entity';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(DegreeDocumentsEntity)
    private readonly degreeRepository: Repository<DegreeDocumentsEntity>,
  ) {}

  async saveDegree(
    topicComplainDoc: string,
    topicApprovalDoc: string,
    tutorAssignmentDoc: string,
    tutorFormatDoc: string,
    antiplagiarismDoc: string,
    tutorLetter: string,
    electiveGrade: string,
    academicClearance: string,
  ): Promise<DegreeDocumentsEntity> {
    const degree = new DegreeDocumentsEntity();
    degree.topicComplainDoc = topicComplainDoc;
    degree.topicApprovalDoc = topicApprovalDoc;
    degree.tutorAssignmentDoc = tutorAssignmentDoc;
    degree.tutorFormatDoc = tutorFormatDoc;
    degree.antiplagiarismDoc = antiplagiarismDoc;
    degree.tutorLetter = tutorLetter;
    degree.electiveGrade = electiveGrade;
    degree.academicClearance = academicClearance;
    return this.degreeRepository.save(degree);
  }

// OBTENER
  async getAllDegrees(): Promise<DegreeDocumentsEntity[]> {
    return this.degreeRepository.find();
  }

// ACTUALIZAR
  async updateDegree(
    id: string,
    updatedFiles: {
      topicComplainDoc?: string;
      topicApprovalDoc?: string;
      tutorAssignmentDoc?: string;
      tutorFormatDoc?: string;
      antiplagiarismDoc?: string;
      tutorLetter?: string;
      electiveGrade?: string;
      academicClearance?: string;
    },
  ): Promise<DegreeDocumentsEntity> {
    const degree = await this.degreeRepository.findOne({ where: { id } });
    if (!degree) {
      throw new NotFoundException(`Grado con ID ${id} no encontrado`);
    }

    if (updatedFiles.topicComplainDoc) {
      degree.topicComplainDoc = updatedFiles.topicComplainDoc;
    }
    if (updatedFiles.topicApprovalDoc) {
      degree.topicApprovalDoc = updatedFiles.topicApprovalDoc;
    }
    if (updatedFiles.tutorAssignmentDoc) {
      degree.tutorAssignmentDoc = updatedFiles.tutorAssignmentDoc;
    }
    if (updatedFiles.tutorFormatDoc) {
      degree.tutorFormatDoc = updatedFiles.tutorFormatDoc;
    }
    if (updatedFiles.antiplagiarismDoc) {
      degree.antiplagiarismDoc = updatedFiles.antiplagiarismDoc;
    }
    if (updatedFiles.tutorLetter) {
      degree.tutorLetter = updatedFiles.tutorLetter;
    }
    if (updatedFiles.electiveGrade) {
      degree.electiveGrade = updatedFiles.electiveGrade;
    }
    if (updatedFiles.academicClearance) {
      degree.academicClearance = updatedFiles.academicClearance;
    }

    return this.degreeRepository.save(degree);
  }

  async getDegreeById(id: string): Promise<DegreeDocumentsEntity> {
    const degree = await this.degreeRepository.findOne({ where: { id } });
    if (!degree) {
      throw new NotFoundException(`Grado con ID ${id} no encontrado`);
    }
    return degree;
  }

}