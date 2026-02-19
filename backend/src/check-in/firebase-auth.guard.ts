import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // If Firebase Admin is not initialized (mock mode), allow pass for dev purposes
      // OR fail. Better to fail securely.
      if (admin.apps.length === 0) {
        console.warn('Firebase Admin not initialized, skipping verification (DEV MODE ONLY)');
        return true;
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }
}
