import { IsEmail, IsNotEmpty, IsEnum, Length, IsOptional } from 'class-validator';
import { UserRole } from '../../../shared/types/user.types';

export class UnifiedSignupDto {
  @IsEnum(UserRole)
  role: UserRole;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 50)
  password: string;

  // For Buyer
  @IsOptional()
  @Length(2, 100)
  fullName?: string;

  // For Seller
  @IsOptional()
  @Length(2, 100)
  businessName?: string;

  @IsOptional()
  @IsNotEmpty()
  businessType?: string;
}