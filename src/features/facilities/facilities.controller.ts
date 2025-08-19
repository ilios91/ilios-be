import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { ClerkUser } from '../../shared/types/user.types';

@Controller('facilities')
@UseGuards(ClerkGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post('register')
  async register(
    @CurrentUser() user: ClerkUser,
    @Body() dto: CreateFacilityDto,
  ) {
    console.log('Registration request from:', user.emailAddresses[0]?.emailAddress);
    
    const facility = await this.facilitiesService.registerFacility(user.id, dto);
    
    return {
      message: 'Facility registered successfully',
      facilityId: facility.id,
    };
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: ClerkUser) {
    const facility = await this.facilitiesService.findByClerkUserId(user.id);
    
    console.log('Profile requested for facility:', facility?.id);
    
    return facility;
  }

  @Get('onboarding-status')
  async getOnboardingStatus(@CurrentUser() user: ClerkUser) {
    console.log('Onboarding status requested for:', user.id);
    return this.facilitiesService.getOnboardingStatus(user.id);
  }
}