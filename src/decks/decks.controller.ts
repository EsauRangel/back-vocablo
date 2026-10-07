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
  findAll() {
    return this.decksService.findAll();
  }

  @Post()
  create(@Body() dto: CreateDeckDto) {
    return this.decksService.create(dto);
  }

  @Post('import')
  @UseInterceptors(jsonUpload)
  importAsNewDeck(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: ImportQueryDto,
  ) {
    const f = assertJsonFile(file);
    return this.decksService.importAsNewDeck(
      f.buffer,
      f.originalname,
      query.title,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.decksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDeckDto) {
    return this.decksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.decksService.remove(id);
  }

  @Post(':id/import')
  @UseInterceptors(jsonUpload)
  importIntoDeck(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.decksService.importIntoDeck(id, assertJsonFile(file).buffer);
  }

  @Get(':id/study')
  study(@Param('id', ParseUUIDPipe) id: string) {
    return this.decksService.dueCards(id);
  }

  @Post(':id/cards')
  addCard(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateCardDto) {
    return this.decksService.addCard(id, dto);
  }

  @Patch(':id/cards/:cardId')
  updateCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.decksService.updateCard(id, cardId, dto);
  }

  @Delete(':id/cards/:cardId')
  @HttpCode(204)
  removeCard(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
  ) {
    return this.decksService.removeCard(id, cardId);
  }

  @Post(':id/cards/:cardId/review')
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() dto: ReviewCardDto,
  ) {
    return this.decksService.reviewCard(id, cardId, dto.rating);
  }
}
