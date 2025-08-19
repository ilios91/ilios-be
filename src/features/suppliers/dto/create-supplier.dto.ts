import { IsNotEmpty, IsEmail, IsString, Length } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty()
  @Length(2, 100)
  supplierName: string;

  @IsString()
  @Length(2, 100)
  supplyType: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @Length(10, 500)
  supplierAddress: string;
}