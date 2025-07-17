import { Inject, Injectable } from "@nestjs/common";
import { CoreRepositoryEnum } from "../enums/core-repository-enum";
import { Repository } from "typeorm";
import { CareerEntity } from "../entities/career.entity";

@Injectable()
export class CareerService {
    constructor(
        @Inject(CoreRepositoryEnum.CAREER_REPOSITORY)
        private readonly careerRepository: Repository<CareerEntity>,
    ) {}

    async findAll(): Promise<CareerEntity[]> {
        return this.careerRepository.find();
    }

    async findById(id: string): Promise<CareerEntity> {
        return this.careerRepository.findOne({ where: { id } });
    }
} 