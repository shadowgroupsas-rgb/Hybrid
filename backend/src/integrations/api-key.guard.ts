import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-cataleya-key'];
    const validApiKey = this.configService.get<string>('CATALEYA_API_KEY') || 'default-secret-key';

    if (apiKey === validApiKey) {
      return true;
    }

    throw new UnauthorizedException('Invalid API Key');
  }
}
