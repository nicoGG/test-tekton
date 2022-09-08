import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
