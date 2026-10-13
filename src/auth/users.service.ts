import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JsonStorageService } from '../storage/json-storage.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly storage: JsonStorageService) {}

  findById(id: string): User | undefined {
    return this.storage.users.find((u) => u.id === id);
  }

  get count(): number {
    return this.storage.users.length;
  }

  findByEmail(email: string): User | undefined {
    const normalized = this.normalizeEmail(email);
    return this.storage.users.find((u) => u.email === normalized);
  }

  async create(
    email: string,
    passwordHash: string,
    name?: string,
  ): Promise<User> {
    const now = new Date().toISOString();
    const normalized = this.normalizeEmail(email);
    const user: User = {
      id: randomUUID(),
      email: normalized,
      name: name?.trim() || normalized.split('@')[0],
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    this.storage.users.push(user);
    await this.storage.save();
    return user;
  }

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
