import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalCustomerAuthGuard extends AuthGuard('customer-jwt') {
  handleRequest(err: any, user: any) {
    return user || null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      return true; // never block — no/invalid token just means an anonymous guest
    }
  }
}
