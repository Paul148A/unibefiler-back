import { CreateGradeDto } from '../dto/grade/create-grade.dto';
import { Body, Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/custom-role-guard/roles.guard";
import { GradeService } from "../services/grade.service";
import { Roles } from "src/auth/custom-role-guard/roles.decorator";

@Controller('api1/grade')
@UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
export class GradeController {
  constructor(
    private readonly gradeService: GradeService,
  ) {}

  @Post('')
    @Roles('student')
    @UseInterceptors(GradeService.getFileUploadInterceptor())
    async uploadPermissionDocument(@UploadedFile() file: Express.Multer.File, @Body() grade: CreateGradeDto
    ) {
      grade.name = file.filename;
      const createGradeEnrollment = await this.gradeService.Create(grade);
      return {
        message: 'Documento de respaldo subido correctamente',
        data: createGradeEnrollment,
      };
    }
}