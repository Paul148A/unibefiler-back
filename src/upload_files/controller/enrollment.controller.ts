import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/custom-role-guard/roles.guard";
import { EnrollmentService } from "../services/enrollment.service";
import { CreateEnrollmentDto } from "../dto/enrollment/create-enrollment.dto";
import { ResponseHttpModel } from "src/auth/models/response-http.model";

@Controller('api1/enrollment')
@UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
export class EnrollmentController {
    constructor(
        private readonly enrollmentService: EnrollmentService,
    ) { }

    @Post('')
    @UseInterceptors(EnrollmentService.getFileUploadInterceptor())
    async uploadGradeDocument(@UploadedFile() file: Express.Multer.File, @Body() grade: CreateEnrollmentDto
    ) {
        grade.name = file.filename;
        const createGradeEnrollment = await this.enrollmentService.Create(grade);
        return {
            message: 'Documento de respaldo subido correctamente',
            data: createGradeEnrollment,
        };
    }

    @Get('inscription/:inscriptionDocumentId')
    @UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
    async getEnrollmentsByInscriptionDocumentsId(@Param('inscriptionDocumentId') inscriptionDocumentId: string): Promise<ResponseHttpModel> {
        const enrollments = await this.enrollmentService.findEnrollmentsByInscriptionDocumentsId(inscriptionDocumentId);
        return {
            title: 'Documentos de inscripción',
            message: 'Documentos de inscripción obtenidos correctamente',
            data: enrollments,
        };
    }
}