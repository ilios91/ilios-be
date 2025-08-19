import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class BuyerOnboardingDto {
  @IsNotEmpty()
  @Length(2, 100)
  legalName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @Length(5, 50)
  registrationNumber: string;
}