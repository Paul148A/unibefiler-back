import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { RecordEntity } from '../entities/record.entity';
import { UploadFilesRepositoryEnum } from '../enums/upload-files-repository.enum';
import { UserEntity } from 'src/auth/entities/user.entity';

@Injectable()
export class RecordService {
  constructor(
    @Inject(UploadFilesRepositoryEnum.RECORD_REPOSITORY)
    private readonly recordRepository: Repository<RecordEntity>,
  ) {}

  async createRecordWithTransaction(userId: string, queryRunner: QueryRunner): Promise<RecordEntity> {
  const code = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const record = new RecordEntity();
  record.code = code;
  record.user = { id: userId } as UserEntity;
  
  return await queryRunner.manager.save(RecordEntity, record);
}

  async createRecord(userId: string): Promise<RecordEntity> {
    const code = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record = this.recordRepository.create({
      code,
      user: { id: userId }
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

  async getAllRecords() {
    return this.recordRepository.find({
      relations: ['user']
    });
}
}