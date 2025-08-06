import { IsEmail, IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class CreateFacilityDto {
  @IsNotEmpty()
  @Length(2, 100)
  legalName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @Length(5, 50)
  registrationNumber: string;
}