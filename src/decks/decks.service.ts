import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JsonStorageService } from '../storage/json-storage.service';
import {
  CreateCardDto,
  CreateDeckDto,
  UpdateCardDto,
  UpdateDeckDto,
} from './dto/deck.dto';
import {
  Card,
  CARD_LEVELS,
  CardLevel,
  Deck,
  REVIEW_INTERVALS,
  ReviewRating,
} from './entities/deck.entity';

export interface DeckSummary {
  id: string;
  title: string;
  totalCards: number;
  dueCards: number;
  createdAt: string;
  updatedAt: string;
}

interface ParsedImport {
  title?: string;
  cards: Card[];
}

@Injectable()
export class DecksService {
  constructor(private readonly storage: JsonStorageService) {}

  findAll(): DeckSummary[] {
    return this.storage.decks.map((deck) => this.toSummary(deck));
  }

  findOne(id: string): Deck {
    const deck = this.storage.decks.find((d) => d.id === id);
    if (!deck) throw new NotFoundException(`Mazo ${id} no encontrado`);
    return deck;
  }

  async create(dto: CreateDeckDto): Promise<Deck> {
    const now = new Date().toISOString();
    const deck: Deck = {
      id: randomUUID(),
      title: dto.title.trim(),
      cards: [],
      createdAt: now,
      updatedAt: now,
    };
    this.storage.decks.push(deck);
    await this.storage.save();
    return deck;
  }

  async update(id: string, dto: UpdateDeckDto): Promise<Deck> {
    const deck = this.findOne(id);
    deck.title = dto.title.trim();
    deck.updatedAt = new Date().toISOString();
    await this.storage.save();
    return deck;
  }

  async remove(id: string): Promise<void> {
    this.findOne(id);
    this.storage.decks = this.storage.decks.filter((d) => d.id !== id);
    await this.storage.save();
  }

  async addCard(deckId: string, dto: CreateCardDto): Promise<Card> {
    const deck = this.findOne(deckId);
    const card = this.buildCard(dto.cardFront, dto.cardBack);
    deck.cards.push(card);
    deck.updatedAt = card.createdAt;
    await this.storage.save();
    return card;
  }

  async updateCard(
    deckId: string,
    cardId: string,
    dto: UpdateCardDto,
  ): Promise<Card> {
    const deck = this.findOne(deckId);
    const card = this.findCard(deck, cardId);
    if (dto.cardFront !== undefined) card.cardFront = dto.cardFront.trim();
    if (dto.cardBack !== undefined) card.cardBack = dto.cardBack.trim();
    card.updatedAt = new Date().toISOString();
    deck.updatedAt = card.updatedAt;
    await this.storage.save();
    return card;
  }

  async removeCard(deckId: string, cardId: string): Promise<void> {
    const deck = this.findOne(deckId);
    this.findCard(deck, cardId);
    deck.cards = deck.cards.filter((c) => c.id !== cardId);
    deck.updatedAt = new Date().toISOString();
    await this.storage.save();
  }

  /** Cards cuya fecha de repaso ya llegó, ordenadas por fecha. */
  dueCards(deckId: string): Card[] {
    const now = Date.now();
    return this.findOne(deckId)
      .cards.filter((c) => new Date(c.nextReview).getTime() <= now)
      .sort(
        (a, b) =>
          new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime(),
      );
  }

  async reviewCard(
    deckId: string,
    cardId: string,
    rating: ReviewRating,
  ): Promise<Card> {
    const deck = this.findOne(deckId);
    const card = this.findCard(deck, cardId);
    const now = Date.now();
    card.level = rating;
    card.nextReview = new Date(now + REVIEW_INTERVALS[rating]).toISOString();
    card.updatedAt = new Date(now).toISOString();
    await this.storage.save();
    return card;
  }

  /** Crea un mazo nuevo a partir del contenido de un archivo JSON. */
  async importAsNewDeck(
    buffer: Buffer,
    fileName: string,
    title?: string,
  ): Promise<Deck> {
    const parsed = this.parseImport(buffer);
    const now = new Date().toISOString();
    const deck: Deck = {
      id: randomUUID(),
      title:
        title?.trim() ||
        parsed.title ||
        fileName.replace(/\.json$/i, '') ||
        'Mazo importado',
      cards: parsed.cards,
      createdAt: now,
      updatedAt: now,
    };
    this.storage.decks.push(deck);
    await this.storage.save();
    return deck;
  }

  /** Agrega las cards de un archivo JSON a un mazo existente. */
  async importIntoDeck(deckId: string, buffer: Buffer): Promise<Deck> {
    const deck = this.findOne(deckId);
    const parsed = this.parseImport(buffer);
    deck.cards.push(...parsed.cards);
    deck.updatedAt = new Date().toISOString();
    await this.storage.save();
    return deck;
  }

  /**
   * Formatos aceptados:
   *  - [{ "cardFront": "...", "cardBack": "..." }, ...]
   *  - { "title": "...", "cards": [ ... ] }
   * Opcionalmente cada card puede traer "level" y "nextReview".
   */
  private parseImport(buffer: Buffer): ParsedImport {
    let data: unknown;
    try {
      data = JSON.parse(buffer.toString('utf8').replace(/^\uFEFF/, ''));
    } catch {
      throw new BadRequestException('El archivo no es un JSON válido');
    }

    let title: string | undefined;
    let items: unknown;
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      items = obj.cards;
      if (typeof obj.title === 'string' && obj.title.trim()) {
        title = obj.title.trim();
      }
    }

    if (!Array.isArray(items)) {
      throw new BadRequestException(
        'El JSON debe ser un arreglo de cards o un objeto con la propiedad "cards"',
      );
    }
    if (items.length === 0) {
      throw new BadRequestException('El archivo no contiene cards');
    }

    const errors: string[] = [];
    const cards: Card[] = [];
    items.forEach((item, index) => {
      const raw = (item ?? {}) as Record<string, unknown>;
      const front = raw.cardFront;
      const back = raw.cardBack;
      if (typeof front !== 'string' || !front.trim()) {
        errors.push(`#${index + 1}: "cardFront" es obligatorio`);
        return;
      }
      if (typeof back !== 'string' || !back.trim()) {
        errors.push(`#${index + 1}: "cardBack" es obligatorio`);
        return;
      }
      const card = this.buildCard(front, back);
      if (
        typeof raw.level === 'string' &&
        CARD_LEVELS.includes(raw.level as CardLevel)
      ) {
        card.level = raw.level as CardLevel;
      }
      if (
        typeof raw.nextReview === 'string' &&
        !Number.isNaN(Date.parse(raw.nextReview))
      ) {
        card.nextReview = new Date(raw.nextReview).toISOString();
      }
      cards.push(card);
    });

    if (errors.length) {
      throw new BadRequestException({
        message: 'Hay cards inválidas en el archivo',
        errors: errors.slice(0, 20),
      });
    }
    return { title, cards };
  }

  private buildCard(cardFront: string, cardBack: string): Card {
    const now = new Date().toISOString();
    return {
      id: randomUUID(),
      cardFront: cardFront.trim(),
      cardBack: cardBack.trim(),
      level: 'new',
      nextReview: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  private findCard(deck: Deck, cardId: string): Card {
    const card = deck.cards.find((c) => c.id === cardId);
    if (!card) throw new NotFoundException(`Card ${cardId} no encontrada`);
    return card;
  }

  private toSummary(deck: Deck): DeckSummary {
    const now = Date.now();
    return {
      id: deck.id,
      title: deck.title,
      totalCards: deck.cards.length,
      dueCards: deck.cards.filter(
        (c) => new Date(c.nextReview).getTime() <= now,
      ).length,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }
}
