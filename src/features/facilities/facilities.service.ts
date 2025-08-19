import { Injectable, ConflictException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UserRole } from '../../shared/types/user.types';
import { Facility } from '@prisma/client';

@Injectable()
export class FacilitiesService {
  private clerkClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.clerkClient = createClerkClient({ secretKey: this.config.clerk.secretKey });
  }

  async registerFacility(clerkUserId: string, dto: CreateFacilityDto): Promise<Facility> {
    console.log('Registering facility:', dto.legalName);

    await this.checkDuplicates(dto);
    
    const savedFacility = await this.prisma.facility.create({
      data: {
        clerkUserId,
        ...dto,
      },
    });
    
    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: UserRole.BUYER,
        facilityId: savedFacility.id,
        onboardingComplete: true,
      },
    });

    console.log('Facility registered and onboarding completed:', savedFacility.id);
    return savedFacility;
  }

  private async checkDuplicates(dto: CreateFacilityDto): Promise<void> {
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

  async findByClerkUserId(clerkUserId: string): Promise<Facility | null> {
    return this.prisma.facility.findUnique({ where: { clerkUserId } });
  }

  async getOnboardingStatus(clerkUserId: string) {
    const facility = await this.findByClerkUserId(clerkUserId);
    return {
      onboardingComplete: !!facility,
      facilityId: facility?.id,
    };
  }
}