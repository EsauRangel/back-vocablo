import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecksModule } from './decks/decks.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [StorageModule, DecksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
