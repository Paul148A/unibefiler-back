import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RecordEntity } from '../entities/record.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';

@Injectable()
export class RecordService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
  ) {}

  async createRecord(
    // personalDocumentsId: string,
    // inscriptionFormId: string,
    // degreeId: string,
  ): Promise<RecordEntity> {
    const record = this.recordRepository.create({
      // personal_documents_id: personalDocumentsId,
      // inscription_form_id: inscriptionFormId,
      // degree_id: degreeId,
    });
    return this.recordRepository.save(record);
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
    // personalDocumentsId?: string,
    // inscriptionFormId?: string,
    // degreeId?: string,
  ): Promise<RecordEntity> {
    const record = await this.recordRepository.findOne({ where: { id } });
    // if (!record) {
    //   throw new NotFoundException(`Record con ID ${id} no encontrado`);
    // }

    // if (personalDocumentsId) {
    //   record.personal_documents_id = personalDocumentsId;
    // }
    // if (inscriptionFormId) {
    //   record.inscription_form_id = inscriptionFormId;
    // }
    // if (degreeId) {
    //   record.degree_id = degreeId;
    // }

    return this.recordRepository.save(record);
  }

  async deleteRecord(id: string): Promise<void> {
    const record = await this.recordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Record con ID ${id} no encontrado`);
    }
    await this.recordRepository.remove(record);
  }
}