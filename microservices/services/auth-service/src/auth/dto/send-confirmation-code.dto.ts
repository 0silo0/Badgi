import { IsEmail } from 'class-validator';

export class SendConfirmationCodeDto {
  @IsEmail()
  email: string;
}
