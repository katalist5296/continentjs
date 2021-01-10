import { Module } from '@rage-framework/core';
import { PlayerModule } from '../player/player.module';

@Module({
  modules: [PlayerModule]
})
export class ServerModule {}
