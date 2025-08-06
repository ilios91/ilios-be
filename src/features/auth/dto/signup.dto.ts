import { IsEmail, IsNotEmpty, IsEnum, Length } from 'class-validator';
import { UserRole } from '../../../shared/types/user.types';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 50)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @Length(2, 100)
  legalName: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @Length(5, 50)
  registrationNumber: string;
}