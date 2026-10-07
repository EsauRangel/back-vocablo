import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { REVIEW_RATINGS, ReviewRating } from '../entities/deck.entity';

export class CreateDeckDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;
}

export class UpdateDeckDto extends CreateDeckDto {}

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  cardFront: string;

  @IsString()
  @IsNotEmpty()
  cardBack: string;
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cardFront?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cardBack?: string;
}

export class ReviewCardDto {
  @IsIn(REVIEW_RATINGS)
  rating: ReviewRating;
}

export class ImportQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
