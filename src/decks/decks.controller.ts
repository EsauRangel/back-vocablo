import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { PublicUser } from '../auth/entities/user.entity';
import { DecksService } from './decks.service';
import {
  CreateCardDto,
  CreateDeckDto,
  ImportQueryDto,
  ReviewCardDto,
  UpdateCardDto,
  UpdateDeckDto,
} from './dto/deck.dto';

const jsonUpload = FileInterceptor('file', {
  limits: { fileSize: 5 * 1024 * 1024 },
});

function assertJsonFile(file?: Express.Multer.File): Express.Multer.File {
  if (!file) throw new BadRequestException('Debes enviar un archivo "file"');
  const isJson =
    /\.json$/i.test(file.originalname) || file.mimetype === 'application/json';
  if (!isJson) throw new BadRequestException('El archivo debe ser .json');
  return file;
}

@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get()
  findAll(@CurrentUser() user: PublicUser) {
    return this.decksService.findAll(user.id);
  }

  @Post()
  create(@Body() dto: CreateDeckDto, @CurrentUser() user: PublicUser) {
    return this.decksService.create(dto, user.id);
  }

  @Post('import')
  @UseInterceptors(jsonUpload)
  importAsNewDeck(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: ImportQueryDto,
    @CurrentUser() user: PublicUser,
  ) {
    const f = assertJsonFile(file);
    return this.decksService.importAsNewDeck(
      f.buffer,
      f.originalname,
      user.id,
      query.title,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeckDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.remove(id, user.id);
  }

  @Post(':id/import')
  @UseInterceptors(jsonUpload)
  importIntoDeck(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.importIntoDeck(
      id,
      assertJsonFile(file).buffer,
      user.id,
    );
  }

  @Get(':id/study')
  study(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.dueCards(id, user.id);
  }

  @Post(':id/cards')
  addCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCardDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.addCard(id, dto, user.id);
  }

  @Patch(':id/cards/:cardId')
  updateCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.updateCard(id, cardId, dto, user.id);
  }

  @Delete(':id/cards/:cardId')
  @HttpCode(204)
  removeCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.removeCard(id, cardId, user.id);
  }

  @Post(':id/cards/:cardId/review')
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: ReviewCardDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.decksService.reviewCard(id, cardId, dto.rating, user.id);
  }
}
