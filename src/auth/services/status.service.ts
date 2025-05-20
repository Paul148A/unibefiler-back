import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuthRepositoryEnum } from "../enums/repository.enum";
import { Repository } from "typeorm";
import { StatusEntity } from "../entities/status.entity";
import { StatusDto } from "../dto/status/status.dto";

@Injectable()
export class StatusService {
    constructor(
        @Inject(AuthRepositoryEnum.STATUS_REPOSITORY)
        private repository: Repository<StatusEntity>,
    ) { }

    async create(payload: StatusDto): Promise<StatusEntity> {
        const newRole = this.repository.create(payload);
        return await this.repository.save(newRole);
    }

    async findOne(id: string): Promise<StatusEntity> {
        const role = await this.repository.findOne({
          where: { id },
        });
    
        if (!role) {
          throw new NotFoundException('El rol con el id: ' + id + ' no existe');
        }
    
        return role;
      }
}