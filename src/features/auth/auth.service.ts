import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UserRole } from '../../shared/types/user.types';

@Injectable()
export class AuthService {
  private clerkClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.clerkClient = createClerkClient({ secretKey: this.config.clerk.secretKey });
  }



  async signup(dto: SignupDto) {
    console.log('Signup attempt for:', dto.email);

    await this.checkDuplicates(dto);

    try {
      const user = await this.clerkClient.users.createUser({
        emailAddress: [dto.email],
        password: dto.password,
        publicMetadata: { role: dto.role },
      });

      if (dto.role === UserRole.BUYER) {
        await this.createFacility(user.id, dto);
      }

      console.log('User created:', user.id);
      
      return {
        message: 'User registered successfully',
        userId: user.id,
        email: dto.email,
        role: dto.role,
      };
    } catch (error) {
      console.log('Clerk signup failed:', error.message);
      throw new ConflictException('Registration failed');
    }
  }

  async signin(dto: SigninDto) {
    console.log('Signin attempt for:', dto.email);

    try {
      const users = await this.clerkClient.users.getUserList({
        emailAddress: [dto.email],
      });

      if (users.data.length === 0) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = users.data[0];
      console.log('User found:', user.id);

      return {
        message: 'Use Clerk frontend SDK for actual authentication',
        userId: user.id,
        email: dto.email,
        role: user.publicMetadata.role,
      };
    } catch (error) {
      console.log('Signin failed:', error.message);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async checkDuplicates(dto: SignupDto): Promise<void> {
    if (dto.role === UserRole.BUYER) {
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

  private async createFacility(clerkUserId: string, dto: SignupDto) {
    await this.prisma.facility.create({
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
        facilityRegistered: true,
      },
    });

    console.log('Facility created for user:', clerkUserId);
  }
}