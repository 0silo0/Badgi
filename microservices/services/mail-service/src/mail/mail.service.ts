import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;  // Имя шаблона
  context?: Record<string, any>;  // Данные для шаблона
  userId?: string;    // Для логирования
}

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    // Создаем запись в логе
    const emailLog = await this.prisma.emailLog.create({
      data: {
        userId: options.userId,
        userEmail: options.to,
        template: options.template || 'custom',
        subject: options.subject,
        status: 'PENDING',
      },
    });

    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@goal-path.ru'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      };

      await this.transporter.sendMail(mailOptions);
      
      // Обновляем статус
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'SENT' },
      });
      
      this.logger.log(`Email sent to ${options.to} (log ID: ${emailLog.id})`);
      return true;
    } catch (error) {
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { 
          status: 'FAILED',
          error: error.message,
        },
      });
      
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // Пример метода для отправки приветственного письма
  async sendWelcomeEmail(email: string, userName: string, userId: string): Promise<boolean> {
    const html = `
      <h1>Добро пожаловать, ${userName}!</h1>
      <p>Вы успешно зарегистрировались в системе GoalPath.</p>
      <p>Ваш логин: ${email}</p>
      <p>С уважением,<br>Команда GoalPath</p>
    `;

    return this.sendMail({
      to: email,
      subject: 'Добро пожаловать в GoalPath!',
      html,
      template: 'welcome',
      userId,
      context: { userName, email },
    });
  }

  // Метод для отправки кода подтверждения
  async sendConfirmationCode(email: string, code: string, userId?: string): Promise<boolean> {
    const html = `
      <h2>Код подтверждения</h2>
      <p>Ваш код подтверждения: <strong>${code}</strong></p>
      <p>Код действителен 15 минут.</p>
      <p>Если вы не запрашивали код, проигнорируйте это письмо.</p>
    `;

    return this.sendMail({
      to: email,
      subject: 'Код подтверждения для GoalPath',
      html,
      template: 'confirmation-code',
      userId,
    });
  }
}