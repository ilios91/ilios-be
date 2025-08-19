import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/config/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async registerSupplier(clerkUserId: string, dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findFirst({
      where: {
        OR: [
          { clerkUserId },
          { email: dto.email },
        ],
      },
    });

    if (existing) {
      console.log('Duplicate supplier detected');
      throw new ConflictException('Supplier already exists');
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        clerkUserId,
        supplierName: dto.supplierName,
        supplyType: dto.supplyType,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        supplierAddress: dto.supplierAddress,
      },
    });

    console.log('Supplier created:', supplier.id);
    return supplier;
  }

  async findByClerkUserId(clerkUserId: string) {
    return this.prisma.supplier.findUnique({
      where: { clerkUserId },
    });
  }

  async getOnboardingStatus(clerkUserId: string) {
    const supplier = await this.findByClerkUserId(clerkUserId);
    
    return {
      isRegistered: !!supplier,
      supplierId: supplier?.id,
      businessName: supplier?.supplierName,
    };
  }
}