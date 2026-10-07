import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { Deck } from '../decks/entities/deck.entity';

interface Database {
  decks: Deck[];
}

/**
 * Persistencia simple en un archivo JSON (data/db.json).
 * Las escrituras se encadenan para evitar condiciones de carrera.
 */
@Injectable()
export class JsonStorageService implements OnModuleInit {
  private readonly filePath =
    process.env.DB_FILE ?? join(process.cwd(), 'data', 'db.json');
  private db: Database = { decks: [] };
  private writeQueue: Promise<void> = Promise.resolve();

  async onModuleInit() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<Database>;
      this.db = { decks: Array.isArray(parsed.decks) ? parsed.decks : [] };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
      await this.persist();
    }
  }

  get decks(): Deck[] {
    return this.db.decks;
  }

  set decks(decks: Deck[]) {
    this.db.decks = decks;
  }

  save(): Promise<void> {
    this.writeQueue = this.writeQueue.then(() => this.persist());
    return this.writeQueue;
  }

  private async persist() {
    await fs.mkdir(dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(this.db, null, 2), 'utf8');
    await fs.rename(tmp, this.filePath);
  }
}
