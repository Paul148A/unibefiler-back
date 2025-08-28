import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILike, QueryRunner, Repository } from 'typeorm';
import { RecordEntity } from '../entities/record.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { UserEntity } from 'src/auth/entities/user.entity';
import { ServiceResponseHttpModel } from 'src/auth/models/service-response-http.model';
import { PersonalService } from './personal.service';
import { InscriptionService } from './inscription.service';
import { DegreeService } from './degree.service';
import { CreatePersonalDocumentsDto } from '../dto/personal-document/create-personal-document.dto';
import { CreateInscriptionDto } from '../dto/inscription-document/create-inscription.dto';
import { CreateDegreeDto } from '../dto/degree-document/create-degree.dto';

@Injectable()
export class RecordService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
    private readonly personalService: PersonalService,
    private readonly inscriptionService: InscriptionService,
    private readonly degreeService: DegreeService,
  ) { }

  async createRecord(userId: string): Promise<RecordEntity> {
    const code = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record = this.recordRepository.create({
      code,
      user: { id: userId }
    });
    const savedRecord = await this.recordRepository.save(record);

    const personalDto: CreatePersonalDocumentsDto = {
      record_id: savedRecord.id,
      pictureDoc: null,
      dniDoc: null,
      votingBallotDoc: null,
      notarizDegreeDoc: null
    };

    const inscriptionDto: CreateInscriptionDto = {
      record_id: savedRecord.id,
      registrationDoc: null,
      semesterGradeChartDoc: null,
      reEntryDoc: null,
      englishCertificateDoc: null,
      enrollmentCertificateDoc: null,
      approvalDoc: null
    };

    const degreeDto: CreateDegreeDto = {
      record_id: savedRecord.id,
      topicComplainDoc: null,
      topicApprovalDoc: null,
      tutorAssignmentDoc: null,
      tutorFormatDoc: null,
      antiplagiarismDoc: null,
      tutorLetter: null,
      electiveGrade: null,
      academicClearance: null
    };

    await Promise.all([
      this.personalService.createInitialPersonalDocuments(savedRecord.id),
      this.inscriptionService.saveInscriptionForm(inscriptionDto),
      this.degreeService.saveDegree(degreeDto)
    ]);

    return savedRecord;
  }

  async getRecordById(id: string): Promise<RecordEntity> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Record con ID ${id} no encontrado`);
    }
    return record;
  }

  async updateRecord(
    id: string,

  ): Promise<RecordEntity> {
    const record = await this.recordRepository.findOne({ where: { id } });

    return this.recordRepository.save(record);
  }

  async deleteRecord(id: string): Promise<void> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Record con ID ${id} no encontrado`);
    }
    await this.recordRepository.remove(record);
  }

  async getAllRecords(): Promise<ServiceResponseHttpModel> {
    const relations = { user: { career: true } };

        const response = await this.recordRepository.findAndCount({
            relations,
        });

        return {
            data: response[0],
        };
  }

  async getRecordsByUserId(userId: string): Promise<RecordEntity[]> {
    const relations = { user: { career: true } };
    const records = await this.recordRepository.find({
      where: { user: { id: userId } },
      relations,
    });
    if (!records || records.length === 0) {
      throw new NotFoundException(`No se encontraron registros para el usuario con ID ${userId}`);
    }
    return records;
  }

  async getRecordsByUserRole(name: string): Promise<ServiceResponseHttpModel> {
    const relations = { user: { role: true } };
    const response = await this.recordRepository.findAndCount({
      where: { user: { role: { name: name } } },
      relations,
    });

    return {
      data: response[0],
    };
  }

  async getRecordsByUserDni(dni: string): Promise<ServiceResponseHttpModel> {
    const relations = { user: { career: true } };
    const response = await this.recordRepository.findAndCount({
      where: {
        user: {
          identification: ILike(`%${dni}%`)
        } as any
      },
      relations,
    });

    return {
      data: response[0],
    };
  }

  async getRecordsByUserName(name: string): Promise<ServiceResponseHttpModel> {
    const relations = { user: { career: true } };
    const response = await this.recordRepository.findAndCount({
      where: [
        {
          user: {
            names: ILike(`%${name}%`)
          } as any
        },
        {
          user: {
            last_names: ILike(`%${name}%`)
          } as any
        }
      ],
      relations,
    });

    return {
      data: response[0],
    };
  }
}