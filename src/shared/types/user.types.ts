export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
}

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  publicMetadata: {
    role?: UserRole;
    onboardingComplete?: boolean;
    facilityId?: string;
    supplierId?: string;
    supplierRegistered?: boolean;
  };
}