import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { StorageModule } from '../storage/storage.module';
import { DecksModule } from '../decks/decks.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from './users.service';

const DEV_SECRET = 'dev-only-insecure-secret-change-me';

function resolveSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }
  return DEV_SECRET;
}

@Module({
  imports: [
    StorageModule,
    DecksModule,
    JwtModule.register({
      global: true,
      secret: resolveSecret(),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          '7d') as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
