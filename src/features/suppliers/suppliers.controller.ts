import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { ClerkUser } from '../../shared/types/user.types';

@Controller('suppliers')
@UseGuards(ClerkGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post('register')
  async register(
    @CurrentUser() user: ClerkUser,
    @Body() dto: CreateSupplierDto,
  ) {
    console.log('Supplier registration request from:', user.emailAddresses[0]?.emailAddress);
    
    const supplier = await this.suppliersService.registerSupplier(user.id, dto);
    
    return {
      message: 'Supplier registered successfully',
      supplierId: supplier.id,
    };
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: ClerkUser) {
    const supplier = await this.suppliersService.findByClerkUserId(user.id);
    
    console.log('Profile requested for supplier:', supplier?.id);
    
    return supplier;
  }

  @Get('onboarding-status')
  async getOnboardingStatus(@CurrentUser() user: ClerkUser) {
    console.log('Onboarding status requested for:', user.id);
    return this.suppliersService.getOnboardingStatus(user.id);
  }
}