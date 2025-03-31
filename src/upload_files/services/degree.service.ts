import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Degree } from '../entities/degree.entity';

@Injectable()
export class DegreeService {
  constructor(
    @InjectRepository(Degree)
    private readonly degreeRepository: Repository<Degree>,
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
  ): Promise<Degree> {
    const degree = new Degree();
    degree.topic_complain_doc = topicComplainDoc;
    degree.topic_approval_doc = topicApprovalDoc;
    degree.tutor_assignment_doc = tutorAssignmentDoc;
    degree.tutor_format_doc = tutorFormatDoc;
    degree.antiplagiarism_doc = antiplagiarismDoc;
    degree.tutor_letter = tutorLetter;
    degree.elective_grade = electiveGrade;
    degree.academic_clearance = academicClearance;
    return this.degreeRepository.save(degree);
  }

// OBTENER
  async getAllDegrees(): Promise<Degree[]> {
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
  ): Promise<Degree> {
    const degree = await this.degreeRepository.findOne({ where: { id } });
    if (!degree) {
      throw new NotFoundException(`Grado con ID ${id} no encontrado`);
    }

    if (updatedFiles.topicComplainDoc) {
      degree.topic_complain_doc = updatedFiles.topicComplainDoc;
    }
    if (updatedFiles.topicApprovalDoc) {
      degree.topic_approval_doc = updatedFiles.topicApprovalDoc;
    }
    if (updatedFiles.tutorAssignmentDoc) {
      degree.tutor_assignment_doc = updatedFiles.tutorAssignmentDoc;
    }
    if (updatedFiles.tutorFormatDoc) {
      degree.tutor_format_doc = updatedFiles.tutorFormatDoc;
    }
    if (updatedFiles.antiplagiarismDoc) {
      degree.antiplagiarism_doc = updatedFiles.antiplagiarismDoc;
    }
    if (updatedFiles.tutorLetter) {
      degree.tutor_letter = updatedFiles.tutorLetter;
    }
    if (updatedFiles.electiveGrade) {
      degree.elective_grade = updatedFiles.electiveGrade;
    }
    if (updatedFiles.academicClearance) {
      degree.academic_clearance = updatedFiles.academicClearance;
    }

    return this.degreeRepository.save(degree);
  }

  async getDegreeById(id: string): Promise<Degree> {
    const degree = await this.degreeRepository.findOne({ where: { id } });
    if (!degree) {
      throw new NotFoundException(`Grado con ID ${id} no encontrado`);
    }
    return degree;
  }

}