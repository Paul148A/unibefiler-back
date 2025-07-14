import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/custom-role-guard/roles.guard";
import { SemesterService } from "../services/semester.service";

@Controller('api1/semesters')
@UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
export class SemesterController {
  constructor(
    private readonly semesterService: SemesterService,
  ) {}

  @Get('')
  async findAllSemesters(){
    const semesters = await this.semesterService.findAll();
    return {
      message: 'Semestres obtenidos correctamente',
      data: semesters,
    };
  }
}