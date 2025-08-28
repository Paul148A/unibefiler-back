import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, Res, Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/custom-role-guard/roles.guard";
import { EnrollmentService } from "../services/enrollment.service";
import { CreateEnrollmentDto } from "../dto/enrollment/create-enrollment.dto";
import { ResponseHttpModel } from "src/auth/models/response-http.model";
import { Response } from 'express';
import { Roles } from "src/auth/custom-role-guard/roles.decorator";

@Controller('api1/enrollment')
@UseGuards(AuthGuard('jwt-cookie'), RolesGuard)
export class EnrollmentController {
    constructor(
        private readonly enrollmentService: EnrollmentService,
    ) { }

    @Post('')
    @UseInterceptors(EnrollmentService.getFileUploadInterceptor())
    async uploadGradeDocument(
        @UploadedFile() file: Express.Multer.File, 
        @Body() grade: CreateEnrollmentDto,
        @Request() req
    ) {
        const fileNamingService = new (await import('../services/file-naming.service')).FileNamingService();
        const userIdentification = req.user?.identification || 'unknown';
        const standardFileName = fileNamingService.generateStandardFileName(
            'file',
            userIdentification,
            file.originalname
        );
        
        const ext = file.originalname.split('.').pop();
        const finalFileName = `${standardFileName}.${ext}`;
        const fs = require('fs');
        const path = require('path');
        const tempFolder = './uploads/documentos-matriculas';
        const userFolder = path.join('./uploads', 'documentos-matriculas', userIdentification);
        
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }
        
        const tempFilePath = path.join(tempFolder, file.filename);
        const userFilePath = path.join(userFolder, finalFileName);
        
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.renameSync(tempFilePath, userFilePath);
                grade.name = finalFileName;
            } catch (error) {
                console.error(`❌ Error moviendo archivo:`, error);
                throw new Error(`Error moviendo archivo: ${error.message}`);
            }
        }
        
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

    @Get('download/:id')
    @Roles('admin')
    async downloadDocument(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        await this.enrollmentService.downloadDocument(id, res);
    }
}