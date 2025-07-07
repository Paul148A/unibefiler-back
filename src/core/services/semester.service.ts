import { Inject, Injectable } from "@nestjs/common";
import { CoreRepositoryEnum } from "../enums/core-repository-enum";
import { Repository } from "typeorm";
import { SemesterEntity } from "../entities/semester.entity";

@Injectable()
export class SemesterService {
    constructor(
        @Inject(CoreRepositoryEnum.SEMESTER_REPOSITORY)
        private readonly gradeRepository: Repository<SemesterEntity>,
    ) {}

    async findAll(): Promise<SemesterEntity[]> {
        return this.gradeRepository.find();
    }

    async findById(id: string): Promise<SemesterEntity> {
        return this.gradeRepository.findOne({ where: { id } });
    }
}