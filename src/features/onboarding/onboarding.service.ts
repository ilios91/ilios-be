import { Injectable, ConflictException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';
import { BuyerOnboardingDto } from './dto/buyer-onboarding.dto';
import { UserRole } from '../../shared/types/user.types';

@Injectable()
export class OnboardingService {
  private clerkClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.clerkClient = createClerkClient({ secretKey: this.config.clerk.secretKey });
  }

  async completeBuyerOnboarding(clerkUserId: string, dto: BuyerOnboardingDto) {
    console.log('Completing buyer onboarding for:', clerkUserId);

    await this.checkDuplicateFacility(dto);

    const facility = await this.prisma.facility.create({
      data: {
        clerkUserId,
        legalName: dto.legalName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        registrationNumber: dto.registrationNumber,
      },
    });

    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: UserRole.BUYER,
        onboardingComplete: true,
        facilityId: facility.id,
      },
    });

    console.log('Buyer onboarding completed:', facility.id);

    return {
      message: 'Onboarding completed successfully',
      facilityId: facility.id,
    };
  }

  async getOnboardingStatus(clerkUserId: string) {
    const user = await this.clerkClient.users.getUser(clerkUserId);
    
    return {
      onboardingComplete: user.publicMetadata.onboardingComplete || false,
      role: user.publicMetadata.role,
    };
  }

  private async checkDuplicateFacility(dto: BuyerOnboardingDto): Promise<void> {
    const existing = await this.prisma.facility.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { registrationNumber: dto.registrationNumber },
        ],
      },
    });

    if (existing) {
      console.log('Duplicate facility detected');
      throw new ConflictException('Facility already exists');
    }
  }
}