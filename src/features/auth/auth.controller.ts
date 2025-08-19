import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BuyerSignupDto } from './dto/buyer-signup.dto';
import { SupplierSignupDto } from './dto/supplier-signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('buyer/signup')
  async buyerSignup(@Body() dto: BuyerSignupDto) {
    console.log('Buyer signup request for:', dto.email);
    return this.authService.buyerSignup(dto);
  }

  @Post('supplier/signup')
  async supplierSignup(@Body() dto: SupplierSignupDto) {
    console.log('Supplier signup request for:', dto.email);
    return this.authService.supplierSignup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto) {
    console.log('Signin request for:', dto.email);
    return this.authService.signin(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    console.log('Forgot password request for:', dto.email);
    return this.authService.forgotPassword(dto.email);
  }


}