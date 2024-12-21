/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { config } from './config/config';
import { environments } from './enviroments';

@Module({
  imports: [
    AuthModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
