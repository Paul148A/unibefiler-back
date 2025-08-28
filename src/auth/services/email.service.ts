import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendRejectionEmail(to: string, userName: string, documentType: string, reason: string) {
    const mailOptions = {
      from: `UNIBE Filer <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Documento rechazado',
      text: `Hola ${userName},\n\nEl documento que has subido llamado "${documentType}" ha sido rechazado y eliminado.\nMotivo: ${reason}\n\nSaludos,\nEquipo Secretaria academica UNIB.E`,
    };

    return this.transporter.sendMail(mailOptions);
  }
} 