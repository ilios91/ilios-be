import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../../shared/config/prisma.service';
import { ConfigService } from '../../shared/config/config.service';
import { UnifiedSignupDto } from './dto/unified-signup.dto';
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

  async signup(dto: UnifiedSignupDto) {
    console.log('Signup attempt for role:', dto.role, 'email:', dto.email);

    this.validateRoleRequiredFields(dto);

    try {
      const userData = this.buildUserData(dto);
      const user = await this.clerkClient.users.createUser(userData);

      console.log('User created:', user.id, 'role:', dto.role);
      
      return {
        message: `${dto.role} account created successfully. Please verify your email.`,
        userId: user.id,
        email: dto.email,
        role: dto.role,
      };
    } catch (error) {
      console.log('Signup failed:', error.message);
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

    try {
      const users = await this.clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.data.length === 0) {
        console.log('User not found for password reset');
        return {
          message: 'If the email exists, a password reset link has been sent',
        };
      }

      const user = users.data[0];
      
      console.log('Password reset initiated for user:', user.id);
      
      return {
        message: 'Password reset email sent successfully',
        email,
      };
    } catch (error) {
      console.log('Password reset failed:', error.message);
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }
  }

  private validateRoleRequiredFields(dto: UnifiedSignupDto): void {
    if (dto.role === UserRole.BUYER) {
      if (!dto.fullName) {
        throw new BadRequestException('Full name is required for buyers');
      }
    }

    if (dto.role === UserRole.SELLER) {
      if (!dto.businessName || !dto.businessType) {
        throw new BadRequestException('Business name and type are required for sellers');
      }
    }
  }

  private buildUserData(dto: UnifiedSignupDto) {
    const baseData = {
      emailAddresses: [dto.email],
      password: dto.password,
      publicMetadata: {
        role: dto.role,
        onboardingComplete: false,
      },
    };

    if (dto.role === UserRole.BUYER) {
      const nameParts = dto.fullName?.split(' ') || [''];
      return {
        ...baseData,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
      };
    }

    if (dto.role === UserRole.SELLER) {
      return {
        ...baseData,
        publicMetadata: {
          ...baseData.publicMetadata,
          businessName: dto.businessName,
          businessType: dto.businessType,
        },
      };
    }

    return baseData;
  }
}