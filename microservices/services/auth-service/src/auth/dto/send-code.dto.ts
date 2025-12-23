import { isEAN, IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class SendCodeDto {
  @IsEmail()
  email: string;
}

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class ResetPassword {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

// src/auth/dto/register.dto.ts
export class RegisterDto extends VerifyCodeDto {
  accountFIO: string;
  login: string;
  status: string;
  password: string;
}
