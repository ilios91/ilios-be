import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { ConfigService } from '../../../shared/config/config.service';

@Injectable()
export class ClerkGuard implements CanActivate {
  private clerkClient;

  constructor(private readonly config: ConfigService) {
    this.clerkClient = createClerkClient({ secretKey: this.config.clerk.secretKey });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.clerk.secretKey,
      });
      
      const user = await this.clerkClient.users.getUser(payload.sub);
      
      request.user = user;
      console.log('User authenticated:', user.emailAddresses[0]?.emailAddress);
      
      return true;
    } catch (error) {
      console.log('Auth failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}