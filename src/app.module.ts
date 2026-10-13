import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DecksModule } from './decks/decks.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [StorageModule, AuthModule, DecksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
