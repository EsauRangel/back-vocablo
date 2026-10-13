import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DecksService } from '../decks/decks.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PublicUser, toPublicUser, User } from './entities/user.entity';
import { hashPassword, verifyPassword } from './password.util';
import { UsersService } from './users.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly decks: DecksService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (this.users.findByEmail(dto.email)) {
      throw new ConflictException('Ya existe una cuenta con ese email');
    }
    const isFirstAccount = this.users.count === 0;
    const passwordHash = await hashPassword(dto.password);
    const user = await this.users.create(dto.email, passwordHash, dto.name);
    if (isFirstAccount) {
      await this.decks.adoptOrphanDecks(user.id);
    }
    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = this.users.findByEmail(dto.email);
    const valid =
      !!user && (await verifyPassword(dto.password, user.passwordHash));
    if (!user || !valid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    return this.buildResponse(user);
  }

  /** Resuelve el usuario de un token ya verificado; null si la cuenta no existe. */
  resolve(payload: JwtPayload): PublicUser | null {
    const user = this.users.findById(payload.sub);
    return user ? toPublicUser(user) : null;
  }

  private buildResponse(user: User): AuthResponse {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      user: toPublicUser(user),
    };
  }
}
