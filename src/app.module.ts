import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { config } from './config/config';
import { environments } from './enviroments';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalDocumentsEntity } from './upload_files/entities/personal-documents.entity';
import { InscriptionDocumentsEntity } from './upload_files/entities/inscription-documents.entity';
import { DegreeDocumentsEntity } from './upload_files/entities/degree-documents.entity';
import { FilesModule } from './upload_files/files.module';
import { RecordEntity } from './upload_files/entities/record.entity';
import { GradeEnrollmentEntity } from './upload_files/entities/grade-enrollment.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || '.env',
      isGlobal: true,
      load: [config],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
      }),
    }),

    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get<string>('DB_HOST'),
    //     port: configService.get<number>('DB_PORT'),
    //     username: configService.get<string>('DB_USER'),
    //     password: configService.get<string>('DB_PASSWORD'),
    //     database: configService.get<string>('DB_NAME'),
    //     entities: [PersonalDocumentsEntity, InscriptionDocumentsEntity, DegreeDocumentsEntity, RecordEntity, GradeEnrollmentEntity],
    //     synchronize: false,
    //   }),
    // }),

    // AuthModule,
    // FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}