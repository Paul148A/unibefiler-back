import { CreateGradeDto } from '../dto/grade/create-grade.dto';
import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
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
    async uploadGradeDocument(@UploadedFile() file: Express.Multer.File, @Body() grade: CreateGradeDto
    ) {
      file.filename = grade.name;
      const createGradeEnrollment = await this.gradeService.Create(grade);
      return {
        message: 'Documento de respaldo subido correctamente',
        data: createGradeEnrollment,
      };
    }

  @Get('inscription/:inscriptionDocumentId')
  @Roles('admin')
  async getGradesByInscriptionDocumentsId( @Param('inscriptionDocumentId') inscriptionDocumentId: string) {
    const grades = await this.gradeService.findGradesByInscriptionDocumentsId(inscriptionDocumentId);
    return {
      message: 'Documentos de notas obtenidos correctamente',
      data: grades,
    };
  }
}