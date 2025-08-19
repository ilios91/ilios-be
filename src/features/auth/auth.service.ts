import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';
import { BuyerSignupDto } from './dto/buyer-signup.dto';
import { SupplierSignupDto } from './dto/supplier-signup.dto';
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

  async buyerSignup(dto: BuyerSignupDto) {
    console.log('Buyer signup attempt for:', dto.email);
    console.log('Request data:', JSON.stringify(dto, null, 2));

    await this.checkBuyerDuplicates(dto);

    try {
      const user = await this.clerkClient.users.createUser({
        emailAddress: [dto.email],
        password: dto.password,
        publicMetadata: { role: UserRole.BUYER },
        skipPasswordRequirement: false,
        skipPasswordChecks: false,
      });

      await this.createFacility(user.id, dto);

      console.log('Buyer created:', user.id);
      
      return {
        message: 'Buyer account created successfully.',
        userId: user.id,
        email: dto.email,
        role: UserRole.BUYER,
      };
    } catch (error) {
      console.log('Buyer signup failed:', error.message);
      console.log('Full error:', error);
      console.log('Error stack:', error.stack);
      if (error.errors?.[0]?.code === 'form_identifier_exists') {
        throw new ConflictException('Email already exists');
      }
      throw new ConflictException('Registration failed');
    }
  }

  async supplierSignup(dto: SupplierSignupDto) {
    console.log('Supplier signup attempt for:', dto.email);

    await this.checkSupplierDuplicates(dto);

    try {
      const user = await this.clerkClient.users.createUser({
        emailAddress: [dto.email],
        password: dto.password,
        publicMetadata: { role: UserRole.SELLER },
        skipPasswordRequirement: false,
        skipPasswordChecks: false,
      });

      await this.createSupplier(user.id, dto);

      console.log('Supplier created:', user.id);
      
      return {
        message: 'Supplier account created successfully.',
        userId: user.id,
        email: dto.email,
        role: UserRole.SELLER,
      };
    } catch (error) {
      console.log('Supplier signup failed:', error.message);
      if (error.errors?.[0]?.code === 'form_identifier_exists') {
        throw new ConflictException('Email already exists');
      }
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

  async forgotPassword(email: string) {
    console.log('Password reset request for:', email);

    // Always return same message for security (prevent email enumeration)
    const secureMessage = 'If the email exists, a password reset link has been sent';

    try {
      // Validate email format first
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { message: secureMessage };
      }

      const users = await this.clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.data.length === 0) {
        console.log('User not found for password reset');
        return { message: secureMessage };
      }

      const user = users.data[0];
      
      // Check if user is verified
      if (user.emailAddresses[0]?.verification?.status !== 'verified') {
        console.log('Unverified user attempted password reset');
        return { message: secureMessage };
      }

      // Create password reset token
      await this.clerkClient.signInTokens.createSignInToken({
        userId: user.id,
        expiresInSeconds: 3600, // 1 hour
      });
      
      console.log('Password reset initiated for user:', user.id);
      
      return { message: secureMessage };
    } catch (error) {
      console.log('Password reset failed:', error.message);
      return { message: secureMessage };
    }
  }

  private async checkBuyerDuplicates(dto: BuyerSignupDto): Promise<void> {
    const existing = await this.prisma.facility.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { registrationNumber: dto.registrationNumber },
        ],
      },
    });

    if (existing) {
      console.log('Duplicate buyer detected');
      throw new ConflictException('Company already exists with this email or registration number');
    }
  }

  private async checkSupplierDuplicates(dto: SupplierSignupDto): Promise<void> {
    const existing = await this.prisma.supplier.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      console.log('Duplicate supplier detected');
      throw new ConflictException('Supplier already exists with this email');
    }
  }

  private async createFacility(clerkUserId: string, dto: BuyerSignupDto) {
    const facility = await this.prisma.facility.create({
      data: {
        clerkUserId,
        companyName: dto.companyName,
        legalName: dto.companyName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        registrationNumber: dto.registrationNumber,
      },
    });

    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: UserRole.BUYER,
        facilityId: facility.id,
        onboardingComplete: true,
      },
    });

    console.log('Facility created for user:', clerkUserId);
  }

  private async createSupplier(clerkUserId: string, dto: SupplierSignupDto) {
    const supplier = await this.prisma.supplier.create({
      data: {
        clerkUserId,
        supplierName: dto.supplierName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        supplierAddress: dto.supplierAddress,
        supplyType: dto.supplyType,
        certificationImage: null,
      },
    });

    await this.clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: UserRole.SELLER,
        supplierId: supplier.id,
        onboardingComplete: true,
      },
    });

    console.log('Supplier created for user:', clerkUserId);
  }


}