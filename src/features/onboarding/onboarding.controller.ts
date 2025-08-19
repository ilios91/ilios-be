import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { BuyerOnboardingDto } from './dto/buyer-onboarding.dto';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { ClerkUser } from '../../shared/types/user.types';

@Controller('onboarding')
@UseGuards(ClerkGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('buyer')
  async completeBuyerOnboarding(
    @CurrentUser() user: ClerkUser,
    @Body() dto: BuyerOnboardingDto,
  ) {
    console.log('Buyer onboarding request from:', user.emailAddresses[0]?.emailAddress);
    return this.onboardingService.completeBuyerOnboarding(user.id, dto);
  }

  @Get('status')
  async getOnboardingStatus(@CurrentUser() user: ClerkUser) {
    console.log('Onboarding status request from:', user.id);
    return this.onboardingService.getOnboardingStatus(user.id);
  }
}