import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DocumentStatusEntity } from '../entities/document-status.entity';
import { CoreRepositoryEnum } from '../enums/core-repository-enum';

@Controller('api1/document-status')
export class DocumentStatusController {
  constructor(
    @Inject(CoreRepositoryEnum.DOCUMENT_STATUS_REPOSITORY)
    private readonly documentStatusRepository: Repository<DocumentStatusEntity>,
  ) {}

  @Get()
  async findAll() {
    return await this.documentStatusRepository.find();
  }
} 