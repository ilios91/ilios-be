import { IsEmail, IsNotEmpty, Length, Matches, IsOptional, IsString } from 'class-validator';

export class SupplierSignupDto {
  @IsNotEmpty()
  @Length(2, 100)
  supplierName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty()
  @Matches(/^\+?[\d\s\-\(\)]{10,15}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @IsNotEmpty()
  @Length(10, 500)
  supplierAddress: string;

  @IsString()
  @Length(2, 100)
  supplyType: string;

  @IsString()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  password: string;
}