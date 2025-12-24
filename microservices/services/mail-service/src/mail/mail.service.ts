import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

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
  private readonly templatesDir = path.join(__dirname, 'templates');

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initializeTransporter();
    this.initializeTemplates();
    this.verifyConnection();
  }

  private initializeTransporter() {
    this.transporter = createTransport({
      service: 'gmail', 
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Connected to email server (Gmail)');
    } catch (error) {
      this.logger.error('❌ SMTP Connection Error:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });
      throw error;
    }
  }

  private initializeTemplates() {
    // Регистрируем вспомогательные функции Handlebars если нужно
    handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString('ru-RU');
    });
    
    handlebars.registerHelper('upperCase', (str: string) => {
      return str?.toUpperCase() || '';
    });
  }

  private compileTemplate(templateName: string, context: any = {}): string {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);

      console.log(this.templatesDir)
      
      if (!fs.existsSync(templatePath)) {
        this.logger.warn(`Template ${templateName}.hbs not found, using default`);
        return this.getDefaultTemplate(templateName, context);
      }
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);
      
      // Добавляем общие данные в контекст
      const fullContext = {
        ...context,
        currentYear: new Date().getFullYear(),
        appName: this.configService.get<string>('APP_NAME', 'GoalPath'),
        appUrl: this.configService.get<string>('APP_URL', 'https://goal-path.ru'),
        supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@goal-path.ru'),
      };
      
      return template(fullContext);
    } catch (error) {
      this.logger.error(`Failed to compile template ${templateName}:`, error);
      return this.getDefaultTemplate(templateName, context);
    }
  }

  private getDefaultTemplate(templateName: string, context: any): string {
    switch (templateName) {
      case 'welcome':
        return `
          <h1>Добро пожаловать, ${context.userName || 'Пользователь'}!</h1>
          <p>Вы успешно зарегистрировались в системе ${context.appName || 'GoalPath'}.</p>
          <p>Ваш логин: ${context.email || 'Не указан'}</p>
          <p>С уважением,<br>Команда ${context.appName || 'GoalPath'}</p>
        `;
      case 'confirmation-code':
        return `
          <h2>Код подтверждения</h2>
          <p>Ваш код подтверждения: <strong>${context.code || 'Не указан'}</strong></p>
          <p>Код действителен 15 минут.</p>
          <p>Если вы не запрашивали код, проигнорируйте это письмо.</p>
        `;
      case 'password-reset':
        return `
          <h2>Сброс пароля</h2>
          <p>Для сброса пароля используйте код: <strong>${context.code || 'Не указан'}</strong></p>
          <p>Ссылка действительна 1 час.</p>
          <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        `;
      default:
        return context.html || context.text || '';
    }
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      await this.transporter.verify();
    } catch (error) {
      this.logger.error('SMTP connection failed:', error);
      return false;
    }

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
      let html = options.html;
      
      // Если указан шаблон, компилируем его
      if (options.template && !html) {
        html = this.compileTemplate(options.template, options.context);
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', this.configService.get<string>('EMAIL_USER', 'nikita2003v33@gmail.com')),
        to: options.to,
        subject: options.subject,
        text: options.text || html?.replace(/<[^>]*>/g, ''),
        html: html || options.text,
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

  // метод для отправки приветственного письма
  async sendWelcomeEmail(email: string, userName: string, userId: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Добро пожаловать в GoalPath!',
      template: 'welcome',
      userId,
      context: { 
        userName, 
        email,
        loginUrl: `${this.configService.get<string>('APP_URL', 'https://goal-path.ru')}/login`
      },
    });
  }

  // Метод для отправки кода подтверждения
  async sendConfirmationCode(email: string, code: string, userId?: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Код подтверждения для GoalPath',
      template: 'confirmation-code',
      userId,
      context: { code },
    });
  }

  async sendPasswordResetEmail(email: string, code: string, userId?: string): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Сброс пароля в GoalPath',
      template: 'password-reset',
      userId,
      context: { 
        code,
        resetUrl: `${this.configService.get<string>('APP_URL', 'https://goal-path.ru')}/reset-password?code=${code}&email=${encodeURIComponent(email)}`
      },
    });
  }

  async sendPasswordChangedEmail(
    email: string, 
    userName: string, 
    userId?: string,
    device?: string
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: 'Пароль успешно изменен - GoalPath',
      template: 'password-changed',
      userId,
      context: {
        userName,
        device: device || 'Неизвестное устройство',
        date: new Date().toLocaleString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@goal-path.ru'),
        appUrl: this.configService.get<string>('APP_URL', 'https://goal-path.ru'),
        recoverUrl: `${this.configService.get<string>('APP_URL', 'https://goal-path.ru')}/recover-password`
      },
    });
  }
}