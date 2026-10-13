import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PublicUser } from './entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user?: PublicUser;
}

/** Inyecta el usuario autenticado que el JwtAuthGuard adjuntó al request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PublicUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user as PublicUser;
  },
);
