import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/custom-role-guard/roles.guard";
import { CareerService } from "../services/career.service";

@Controller('api1/careers')
@UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
export class CareerController {
  constructor(
    private readonly careerService: CareerService,
  ) {}

  @Get('')
  async findAllCareers(){
    const careers = await this.careerService.findAll();
    return {
      message: 'Carreras obtenidas correctamente',
      data: careers,
    };
  }
} 