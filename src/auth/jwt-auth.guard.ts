import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService, JwtPayload } from './auth.service';
import { AuthenticatedRequest } from './current-user.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException('Falta el token de acceso');

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = this.auth.resolve(payload);
    if (!user) throw new UnauthorizedException('La cuenta ya no existe');

    request.user = user;
    return true;
  }

  private extractToken(header?: string): string | undefined {
    const [scheme, value] = header?.split(' ') ?? [];
    return scheme?.toLowerCase() === 'bearer' && value ? value : undefined;
  }
}
